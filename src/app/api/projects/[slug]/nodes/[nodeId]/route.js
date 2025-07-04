// File: /api/projects/[slug]/nodes/[nodeId]/route.js

import { Project } from "@/models/Project";
import { ProjectNode } from "@/models/ProjectNode";
import { asyncHandler } from "@/utils/asyncHandler";
import { send_response } from "@/utils/apiResponse";
import { StatusCodes } from "@/helper/api/statusCode";
import dbConnect from "@/lib/db";
import { cookies } from 'next/headers';
// ------------------ UPDATE NODE ------------------
export const PUT = asyncHandler(async (req, { params }) => {
  await dbConnect();

  const body = await req.json();
  const { content, name } = body;
  const { slug, nodeId } =await params;
  // const cookieStore =await cookies();
  // const editToken = cookieStore.get("editToken")?.value;

  if ( !slug || !nodeId) {
    return send_response(false, null, "slug, nodeId, are required", StatusCodes.BAD_REQUEST);
  }

  const node = await ProjectNode.findById(nodeId);
  if (!node) {
    return send_response(false, null, "File/Folder not found", StatusCodes.NOT_FOUND);
  }

  const project = await Project.findOne({ slug });
  if (!project) {
    return send_response(false, null, "Project not found", StatusCodes.NOT_FOUND);
  }

  // if (project.editToken !== editToken) {
  //   return send_response(false, null, "Invalid edit token", StatusCodes.FORBIDDEN);
  // }

  if (content !== undefined && node.type !== 'file') {
    return send_response(false, null, "Cannot add content to a folder", StatusCodes.BAD_REQUEST);
  }

  if (name !== undefined && name.trim() === "") {
    return send_response(false, null, "Name cannot be empty", StatusCodes.BAD_REQUEST);
  }

  const updates = {};
  if (content !== undefined) updates.content = content;
  if (name !== undefined) updates.name = name.trim();
  updates.updatedAt = new Date();

  const updatedNode = await ProjectNode.findByIdAndUpdate(nodeId, { $set: updates }, { new: true });

  return send_response(true, updatedNode, "File/Folder updated successfully", StatusCodes.OK);
});

// ------------------ DELETE NODE ------------------
export const DELETE = asyncHandler(async (req, { params }) => {
  await dbConnect();

  
  const { slug, nodeId } =await params;
  // const cookieStore =await cookies();
  // const editToken = cookieStore.get("editToken")?.value;

  if (!nodeId || !slug ) {
    return send_response(false, null, "slug, nodeId  are required!", StatusCodes.BAD_REQUEST);
  }

  const node = await ProjectNode.findById(nodeId);
  if (!node) {
    return send_response(false, null, "File/Folder not found", StatusCodes.NOT_FOUND);
  }

  const project = await Project.findById(node.projectId);
  if (!project) {
    return send_response(false, null, "Project not found", StatusCodes.NOT_FOUND);
  }

  // if (project.editToken !== editToken) {
  //   return send_response(false, null, "Invalid edit token", StatusCodes.FORBIDDEN);
  // }

  async function deleteNodeRecursively(id) {
    const children = await ProjectNode.find({ parentId: id });
    for (const child of children) {
      await deleteNodeRecursively(child._id);
    }
    await ProjectNode.deleteOne({ _id: id });
  }

  await deleteNodeRecursively(nodeId);

  return send_response(true, null, "Node deleted successfully", StatusCodes.OK);
});