import { send_response } from "@/utils/apiResponse";
import { Project } from "@/models/Project";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import dbConnect from "@/lib/db";
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

export const POST = asyncHandler(async (req) => {
  await dbConnect();
  const body = await req.json();

  const name = body.name;
  const type = body.type;
  const expiresIn = body.expiresIn;

  // Validate inputs
  if (!name) {
    return send_response(false, null, "name is required!", StatusCodes.BAD_REQUEST);
  }

  if (expiresIn && !['1m', '1h', '24h', '2d', '3d'].includes(expiresIn)) {
    return send_response(false, null, "Invalid expiresIn value!", StatusCodes.BAD_REQUEST);
  }

  
  const projectData = {
    name: name || 'Untitled Project',
    expiresIn,
    type,
    slug: nanoid(8)
   
  };

  const project = await Project.create(projectData);

  // Prepare response data
  const responseData = {
    slug: project.slug,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/share/${project.slug}`,
    expiresAt: project.expiresAt.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'long'
    }),
    expiresIn: project.expiresIn
  };


  return send_response(true, responseData, "Folder created successfully", StatusCodes.CREATED);
});
