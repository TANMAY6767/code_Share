import { send_response } from "@/utils/apiResponse";
import { codeFile } from "@/models/codeFile";
import { StatusCodes } from "@/helper/api/statusCode";
import dbConnect from "@/lib/db";

export const GET = async (request, { params }) => {
  try {
    await dbConnect();

    const { shareId } = params;
    console.log("shareId:", shareId);

    const file = await codeFile.findOne({ shareId });

    if (!file) {
      return send_response(false, null, "File not found", StatusCodes.NOT_FOUND);
    }

    return send_response(true, file, "File retrieved", StatusCodes.OK);
  } catch (error) {
    console.error("API Error:", error);
    return send_response(false, null, "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};