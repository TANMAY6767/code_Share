import { send_response } from "@/utils/apiResponse";
import { Project } from "@/models/Project";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import dbConnect from "@/lib/db";
import { NextResponse } from 'next/server';

export const POST = asyncHandler(async (req) => {
  await dbConnect();
  const { slug, editToken } = await req.json();

  if (!slug || !editToken) {
    return send_response(false, null, "Slug and edit token are required", StatusCodes.BAD_REQUEST);
  }

  const project = await Project.findOne({ slug });

  if (!project) {
    return send_response(false, null, "Project not found", StatusCodes.NOT_FOUND);
  }

  if (project.editToken !== editToken) {
    return send_response(false, null, "Invalid edit token", StatusCodes.FORBIDDEN);
  }

  // Valid token — set cookie
  const response = NextResponse.json(
    send_response(true, null, "Edit token verified", StatusCodes.OK)
  );
  response.cookies.set("editToken", editToken, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 60 * 60 * 5, // 5 hours
    path: "/",
  });

  return response;
});
