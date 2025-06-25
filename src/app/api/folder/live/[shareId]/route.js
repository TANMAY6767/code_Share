import { send_response } from "@/utils/apiResponse";
import { CodeBlock } from "@/models/codeblock";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import dbConnect from "@/lib/db";

export const GET = asyncHandler(async (request, { params }) => {
  await dbConnect();
  const { shareId } = await params;

  const file = await CodeBlock.findOne({ shareId });
  if (!file) {
    return send_response(StatusCodes.NOT_FOUND, false, "File not found");
  }
  
  return send_response(
    
    true, 
    {
      ...file.toObject(),
     wsUrl: `${process.env.NEXT_PUBLIC_WS_URL}?shareId=${shareId}`

    },
    "File retrieved", 
     StatusCodes.OK,
  );
}); 