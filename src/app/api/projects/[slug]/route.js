// File: /api/projects/[slug]/route.js

import { send_response } from "@/utils/apiResponse";
import { Project } from "@/models/Project";
import { ProjectNode } from "@/models/ProjectNode";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import dbConnect from "@/lib/db";
import { cookies } from 'next/headers';

// ------------------ GET Project ------------------
export const GET = asyncHandler(async (request, { params }) => {
  await dbConnect();
  const { slug } = await params;
  const cookieStore = await cookies();
  // const editToken = cookieStore.get("editToken")?.value;
  console.log("slug is :- ",slug);
  const project = await Project.findOne({ slug });

  if (!project) {
    return send_response(false, null, "Project not found", StatusCodes.NOT_FOUND);
  }

  const nodes = await ProjectNode.find({ projectId: project._id });

  const nodeMap = {};
  const rootNodes = [];

  nodes.forEach((node) => {
    nodeMap[node._id] = {
      ...node.toObject(),
      children: []
    };
  });

  nodes.forEach((node) => {
    if (node.parentId) {
      const parent = nodeMap[node.parentId];
      if (parent) {
        parent.children.push(nodeMap[node._id]);
      }
    } else {
      rootNodes.push(nodeMap[node._id]);
    }
  });

  const responseData = {
    project: {
      _id: project._id,
      name: project.name,
      slug: project.slug,
      type: project.type,
      expiresAt: project.expiresAt,
      createdAt: project.createdAt,
      // ...(editToken === project.editToken && { editToken: project.editToken })
    },
    fileStructure: rootNodes,
    wsUrl: `${process.env.NEXT_PUBLIC_WS_URL}?projectId=${project._id}`
  };

  return send_response(true, responseData, "Project retrieved successfully", StatusCodes.OK);
});

// ------------------ UPDATE Project ------------------
export const PUT = asyncHandler(async (req, { params }) => {
  await dbConnect();

  const body = await req.json();
  const { type, name, expiresIn, slug: newSlug } = body;
  const { slug: existingSlug } = await params;
  // const cookieStore = await cookies();
  // const editToken = cookieStore.get("editToken")?.value;

  if (!existingSlug) {
    return send_response(false, null, "slug and editToken are required", StatusCodes.BAD_REQUEST);
  }
  console.log("time- ",expiresIn);
  const project = await Project.findOne({ slug: existingSlug });
  if (!project) {
    return send_response(false, null, "Project not found", StatusCodes.NOT_FOUND);
  }

  // if (project.editToken !== editToken) {
  //   return send_response(false, null, "Invalid edit token", StatusCodes.FORBIDDEN);
  // }

  if (name !== undefined) project.name = name;
  if (type !== undefined) {
    if (!["editable", "read-only"].includes(type)) {
      return send_response(false, null, "Invalid type value", StatusCodes.BAD_REQUEST);
    }
    project.type = type;
  }
  if (newSlug !== undefined) project.slug = newSlug;

  if (expiresIn) {
    const validDurations = {
      '1m': 60000,
      '1h': 3600000,
      '24h': 86400000,
      '2d': 172800000,
      '3d': 259200000,
    };

    if (!validDurations[expiresIn]) {
      return send_response(false, null, "Invalid expiresIn value", StatusCodes.BAD_REQUEST);
    }

    project.expiresIn = expiresIn;
    project.expiresAt = new Date(Date.now() + validDurations[expiresIn]);
  
  }

  await project.save();

  const responseData = {
    shareId: project.slug,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/share/${project.slug}`,
    expiresAt: project.expiresAt.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'long'
    }),
    expiresIn: project.expiresIn
  };

  return send_response(true, responseData, "Project updated successfully", StatusCodes.OK);
});

// ------------------ DELETE Project ------------------
export const DELETE = asyncHandler(async (req, { params }) => {
  await dbConnect();
  const { slug } =await params;
  // const cookieStore =await cookies();
  // const editToken = cookieStore.get("editToken")?.value;

  if ( !slug) {
    return send_response(false, null, "slug is required!", StatusCodes.BAD_REQUEST);
  }

  const project = await Project.findOne({ slug });
  if (!project) {
    return send_response(false, null, "Project not found", StatusCodes.NOT_FOUND);
  }

  // if (project.editToken !== editToken) {
  //   return send_response(false, null, "Invalid edit token", StatusCodes.FORBIDDEN);
  // }

  await ProjectNode.deleteMany({ projectId: project._id });
  await Project.deleteOne({ _id: project._id });

  return send_response(true, null, "Project deleted successfully", StatusCodes.CREATED);
});