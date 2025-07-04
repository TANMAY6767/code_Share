// app/api/projects/[slug]/structure/route.js
import { send_response } from "@/utils/apiResponse";
import { ProjectNode } from "@/models/ProjectNode";
import { Project } from "@/models/Project";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import dbConnect from "@/lib/db";
import { cookies } from 'next/headers';
import mongoose from 'mongoose';

export const PUT = asyncHandler(async (req, { params }) => {
  await dbConnect();
  
  const { slug } = await params;
  const { created = [], updated = [], deleted = [] } = await req.json();
 
  if ( !slug) {
    return send_response(false, null, "Missing slug ", StatusCodes.BAD_REQUEST);
  }

  const project = await Project.findOne({ slug });
  if (!project) return send_response(false, null, "Project not found", StatusCodes.NOT_FOUND);
  

  const projectId = project._id;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Handle deletions
    if (deleted.length > 0) {
      await ProjectNode.deleteMany({
        _id: { $in: deleted.filter(id => !id.startsWith('temp-')) },
        projectId
      }).session(session);
    }

    // 2. Handle updates
    if (updated.length > 0) {
      const bulkOps = updated
        .filter(node => !node._id.startsWith('temp-')) // Filter out temp IDs
        .map(node => ({
          updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(node._id), projectId },
            update: {
              $set: {
                name: node.name,
                content: node.content || '',
                updatedAt: new Date()
              }
            }
          }
        }));
      
      if (bulkOps.length > 0) {
        await ProjectNode.bulkWrite(bulkOps, { session });
      }
    }

    // 3. Handle creations
    if (created.length > 0) {
  const idMapping = {};

  // First pass: insert all nodes with temporary parentId resolved to null (for now)
  const nodesToCreate = created.map(node => ({
    name: node.name,
    type: node.type,
    content: node.content || '',
    parentId: node.parentId?.startsWith('temp-') ? null : node.parentId,
    projectId,
    tempId: node.tempId?.startsWith('temp-') ? node.tempId : undefined
  }));
  console.log("nodesToCreate", nodesToCreate);

  const createdNodes = await ProjectNode.insertMany(nodesToCreate, { session });
console.log("idMapping", idMapping);

  // Map tempId to new MongoDB ID
  created.forEach((node, index) => {
    if (node.tempId?.startsWith('temp-')) {
  idMapping[node.tempId] = createdNodes[index]._id.toString();
}

  });

  // Second pass: update parentIds where parentId was a temp id
  const updateOps = [];

  createdNodes.forEach((createdNode, i) => {
    const originalNode = created[i];
    if (originalNode.parentId?.startsWith('temp-') && idMapping[originalNode.parentId]) {
      updateOps.push({
        updateOne: {
          filter: { _id: createdNode._id },
          update: {
            $set: {
              parentId: idMapping[originalNode.parentId]
            }
          }
        }
      });
    }
  });

  if (updateOps.length > 0) {
    await ProjectNode.bulkWrite(updateOps, { session });
  }

  await session.commitTransaction();
  return send_response(true, { idMapping }, "Changes applied successfully", StatusCodes.OK);
}

    await session.commitTransaction();
    return send_response(true, null, "Changes applied successfully", StatusCodes.OK);
  } catch (error) {
    await session.abortTransaction();
    console.error("Transaction error:", error);
    return send_response(false, null, error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  } finally {
    session.endSession();
  }
});  