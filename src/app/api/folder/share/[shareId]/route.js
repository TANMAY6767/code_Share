import { send_response } from "@/utils/apiResponse";
import { codeFile } from "@/models/codeFile";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import dbConnect from "@/lib/db";

export const GET = asyncHandler(async (req, { params }) => {
  try {
    await dbConnect();

    const { shareId } = params;
    console.log("shareId:", shareId);

    const files = await codeFile.find({ shareId });

    if (!files || files.length === 0) {
      return send_response(
        false,
        null,
        "Files not found",
        StatusCodes.NOT_FOUND
      );
    }

    return send_response(
      true,
      files,
      "Files retrieved successfully",
      StatusCodes.OK
    );
  } catch (error) {
    console.error("Error in GET /api/folder/share/[shareId]:", error);
    return send_response(
      false,
      null,
      "Internal server error",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
});
