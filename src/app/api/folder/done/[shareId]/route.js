import { send_response } from "@/utils/apiResponse";
import { codeFile } from "@/models/codeFile";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import dbConnect from "@/lib/db";

export const POST = asyncHandler(async (req, params) => {

    await dbConnect();

    // Extract shareId from the URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const shareId = pathParts[pathParts.length - 1]; // Get the last part of the path

    console.log("Extracted shareId:", shareId);

    const body = await req.json();
    const filename = body.filename;
    const language = body.language;
    const content = body.content;
    const type = body.type;
    const expiresIn = body.expiryTime;

    const durationMap = {
        '1m': 60000,
        '1h': 3600000,
        '24h': 86400000,
        '2d': 172800000,
        '3d': 259200000
    };

    const expiresInMs = durationMap[expiresIn || '1h'];
    const expiresAt = new Date(Date.now() + expiresInMs);

    if (!filename || !language) {
        return send_response(false, null, "filename and language are required!", StatusCodes.BAD_REQUEST);
    }
    if (expiresIn && !['1m', '1h', '24h', '2d', '3d'].includes(expiresIn)) {
        return send_response(false, null, "Invalid expiresIn value!", StatusCodes.BAD_REQUEST);
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
                expiresIn: expiresIn || '1h',
                expiresAt: expiresAt, // ✅ set this manually
            },
            { new: true } // Return the updated document
        );

        if (!updatedFile) {
            return send_response(false, null, "File not found", StatusCodes.NOT_FOUND);
        }

        const responseData = {
            shareId: updatedFile.shareId,
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/share/${updatedFile.shareId}`,
            expiresAt: updatedFile.expiresAt.toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                dateStyle: 'full',
                timeStyle: 'long'
            }),
            expiresIn: updatedFile.expiresIn
        };


        return send_response(true, responseData, "File updated successfully", StatusCodes.OK);
    } else {


        return send_response(false, null, "send url", StatusCodes.BAD_REQUEST);
    }
});