import { send_response } from "@/utils/apiResponse";
import { codeFile } from "@/models/codeFile";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import dbConnect from "@/lib/db";

export const POST = asyncHandler(async (req) => {
    await dbConnect();
     const body = await req.json();
    
    const filename = body.filename;
    const language = body.language;
    const content = body.content;
    const type = body.type;
    
    
    if (!filename || !language) {
        return send_response(false, null, "filename and language are required!", StatusCodes.BAD_REQUEST);
    }

    // Create the code file
    const shareId = await codeFile.generateShareId();
    const newFile = new codeFile({
        filename,
        language,
        type,
        content: content || '',
        shareId
    });
    await newFile.save();

    // Create the folder with this file
    // const shareId = await Folder.generateShareId();
    // const newFolder = new Folder({
    //     name: filename,
    //     files: [newFile._id],
    //     shareId
    // });
    // await newFolder.save();

    const responseData = { 
        shareId: newFile.shareId,
        url: `http://localhost:3000/share/${newFile.shareId}` 
    };
    
    return send_response(true, responseData, "Folder created successfully", StatusCodes.CREATED);
});