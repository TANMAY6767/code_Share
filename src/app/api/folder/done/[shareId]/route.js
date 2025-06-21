import { send_response } from "@/utils/apiResponse";
import { codeFile } from "@/models/codeFile";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import dbConnect from "@/lib/db";

export const POST = asyncHandler(async (req,params) => {
    await dbConnect();
    await dbConnect();
    
    // Extract shareId from the URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const shareId = pathParts[pathParts.length - 1]; // Get the last part of the path
    
    console.log("Extracted shareId:", shareId);
    
    const body = await req.json();
    const { filename, language, content, type } = body;
    
    if (!filename || !language) {
        return send_response(false, null, "filename and language are required!", StatusCodes.BAD_REQUEST);
    }

    if (shareId) {
        // Update existing file
        const updatedFile = await codeFile.findOneAndUpdate(
            { shareId: shareId },
            {
                filename,
                language,
                type,
                content: content || '',
            },
            { new: true } // Return the updated document
        );
        
        if (!updatedFile) {
            return send_response(false, null, "File not found", StatusCodes.NOT_FOUND);
        }
        
        const responseData = { 
            shareId: updatedFile.shareId,
            url: `http://localhost:3000/share/${updatedFile.shareId}` 
        };
        
        return send_response(true, responseData, "File updated successfully", StatusCodes.OK);
    } else {
        
        
        return send_response(false,null, "send url", StatusCodes.BAD_REQUEST);
    }
});