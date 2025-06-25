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
  const shareId = pathParts[pathParts.length - 1];

  console.log("Extracted shareId:", shareId);

  const body = await req.json();
  const { alias } = body;

  if (!alias || !shareId) {
    return send_response(false, null, "Alias and shareId are required!", StatusCodes.BAD_REQUEST);
}
if (alias === shareId) {
  return send_response(false, null, "Custom alias cannot be the same as the current alias", StatusCodes.BAD_REQUEST);
}
if (alias.length < 5) {
    return send_response(false, null, "Alias must be at least 5 characters long", StatusCodes.BAD_REQUEST);
}
if (alias.length > 20) {
  return send_response(false, null, "Alias must not exceed 20 characters", StatusCodes.BAD_REQUEST);
}

  // Step 1: Check if alias already exists
  const aliasExists = await codeFile.findOne({ shareId: alias });

  if (aliasExists) {
    return send_response(false, null, "Alias already exists", StatusCodes.CONFLICT);
  }

  // Step 2: Update the shareId of the original document
  const updatedFile = await codeFile.findOneAndUpdate(
    { shareId: shareId },
    { shareId: alias },
    { new: true }
  );

  if (!updatedFile) {
    return send_response(false, null, "Original file not found", StatusCodes.NOT_FOUND);
  }

  const responseData = {
    shareId: updatedFile.shareId,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/${updatedFile.shareId}`
  };

  return send_response(true, responseData, "Alias updated successfully", StatusCodes.OK);
});
