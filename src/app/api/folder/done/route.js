import { send_response } from "@/utils/apiResponse";
import { codeFile } from "@/models/codeFile";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import dbConnect from "@/lib/db";

export const POST = asyncHandler(async (req) => {
    await dbConnect();
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const shareId = searchParams.get('shareId');
    
    console.log("shareId:", shareId);
    
    const filename = body.filename;
    const language = body.language;
    const content = body.content;
    const type = body.type;
    
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
        
        
        return send_response(true, responseData, "send url", StatusCodes.BAD_REQUEST);
    }
});