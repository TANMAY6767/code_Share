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
    const expiresIn = body.expiresIn;


    if (!filename || !language) {
        return send_response(false, null, "filename and language are required!", StatusCodes.BAD_REQUEST);
    }
    if (expiresIn && !['1m', '1h', '24h', '2d', '3d'].includes(expiresIn)) {
    return send_response(false, null, "Invalid expiresIn value!", StatusCodes.BAD_REQUEST);
}
    // Create the code file
    const shareId = await codeFile.generateShareId();
    const newFile = new codeFile({
        filename,
        language,
        type,
        content: content || '',
        shareId,
        expiresIn: expiresIn || '1h',
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

    // In your route.js response:
    const responseData = {
    shareId: newFile.shareId,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/share/${newFile.shareId}`,
    expiresAt: newFile.expiresAt.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'long'
    }),
    expiresIn: newFile.expiresIn
};

    return send_response(true, responseData, "Folder created successfully", StatusCodes.CREATED);
});