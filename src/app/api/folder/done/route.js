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
    const expiresIn = body.expiryTime; // Now using expiresIn instead of expiresAt

    console.log("time:-",expiresIn);

    if (!filename || !language) {
        return send_response(false, null, "filename and language are required!", StatusCodes.BAD_REQUEST);
    }

    if (shareId) {
        const updateFields = {
            filename,
            language,
            type,
            content: content || '',
            expiresIn
        };


        if (expiresIn) {
            updateFields.expiresIn = expiresIn;

        }

        const updatedFile = await codeFile.findOneAndUpdate(
            { shareId: shareId },
            updateFields,
            { new: true } // Return the updated document
        );

        if (!updatedFile) {
            return send_response(false, null, "File not found", StatusCodes.NOT_FOUND);
        }

        // In your route.js response:
        const responseData = {
            shareId: newFile.shareId,
            url: `http://localhost:3000/share/${newFile.shareId}`,
            expiresAt: new Date(newFile.expiresAt).toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                dateStyle: 'full',
                timeStyle: 'long'
            }),
            expiresIn: newFile.expiresIn
        };

        return send_response(true, responseData, "File updated successfully", StatusCodes.OK);
    } else {


        return send_response(true, responseData, "send url", StatusCodes.BAD_REQUEST);
    }
});