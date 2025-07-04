import { send_response } from "@/utils/apiResponse";
import { Project } from "@/models/Project";
import { ProjectNode } from "@/models/ProjectNode";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import dbConnect from "@/lib/db";
import { cookies } from 'next/headers';

export const POST = asyncHandler(async (req,{params}) => {
    await dbConnect();

    const body = await req.json();
    const { name, type, parentId, content } = body;
    const { slug } =await params;
    // const cookieStore =await cookies();
    // const editToken = cookieStore.get("editToken")?.value;




    // ✅ Validate required fields
    if (!slug || !name || !type) {
        return send_response(
            false,
            null,
            "slug, name, and type are required",
            StatusCodes.BAD_REQUEST
        );
    }

    // ✅ Validate type
    if (!["file", "folder"].includes(type)) {
        return send_response(false, null, "Invalid node type", StatusCodes.BAD_REQUEST);
    }

    // ✅ Find the project
    const project = await Project.findOne({ slug });
    if (!project) {
        return send_response(false, null, "Project not found", StatusCodes.NOT_FOUND);
    }

    // ✅ Check edit token
    // if (project.editToken !== editToken) {
    //     return send_response(false, null, "Invalid edit token", StatusCodes.FORBIDDEN);
    // }

    // ✅ Create the node
    const newNode = await ProjectNode.create({
        name: name.trim(),
        type,
        content: type === "file" ? content || "" : "",
        parentId: parentId || null,
        projectId: project._id,
    });

    const responseData = {
        _id: newNode._id,
        name: newNode.name,
        type: newNode.type,
        parentId: newNode.parentId,
        projectId: newNode.projectId,
        content: newNode.content,
        createdAt: newNode.createdAt,
    };

    return send_response(true, responseData, "Node created successfully", StatusCodes.CREATED);
});
