import { send_response } from "@/utils/apiResponse";
import { CodeBlock } from "@/models/codeblock";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import dbConnect from "@/lib/db";

export const PUT = asyncHandler(async (req, params) => {
  await dbConnect();

  // Extract shareId from URL path
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const shareId = pathParts[pathParts.length - 1];

  const body = await req.json();
  const { alias, expiresIn } = body;

  // Validate at least one parameter exists
  if (!alias && !expiresIn) {
    return send_response(
      false,
      null,
      "At least one parameter (alias or expiresIn) is required!",
      StatusCodes.BAD_REQUEST
    );
  }

  // Alias validations
  if (alias) {
    if (alias === shareId) {
      return send_response(
        false,
        null,
        "Custom alias cannot be the same as the current alias",
        StatusCodes.BAD_REQUEST
      );
    }
    if (alias.length < 5) {
      return send_response(
        false,
        null,
        "Alias must be at least 5 characters long",
        StatusCodes.BAD_REQUEST
      );
    }
    if (alias.length > 20) {
      return send_response(
        false,
        null,
        "Alias must not exceed 20 characters",
        StatusCodes.BAD_REQUEST
      );
    }

    // Check alias uniqueness
    const aliasExists = await CodeBlock.findOne({ shareId: alias });
    if (aliasExists) {
      return send_response(
        false,
        null,
        "Alias already exists",
        StatusCodes.CONFLICT
      );
    }
  }

  // expiresIn validations
  if (expiresIn) {
    const validExpiresInValues = ['1m', '1h', '3h', '24h', '2d', '3d'];
    if (!validExpiresInValues.includes(expiresIn)) {
      return send_response(
        false,
        null,
        "Invalid expiresIn value. Valid values are: 1m, 1h, 3h, 24h, 2d, 3d",
        StatusCodes.BAD_REQUEST
      );
    }
  }

  // Duration mapping (matches model's pre-save hook)
  const durationMap = {
    '1m': 60000,       // 1 minute
    '1h': 3600000,     // 1 hour
    '3h': 10800000,    // 3 hours
    '24h': 86400000,   // 24 hours
    '2d': 172800000,   // 2 days
    '3d': 259200000    // 3 days
  };

  // Prepare update object
  const updateFields = {};
  if (alias) updateFields.shareId = alias;
  if (expiresIn) {
    updateFields.expiresIn = expiresIn;
    updateFields.expiresAt = new Date(Date.now() + durationMap[expiresIn]);
  }

  // Update document
  const updatedFile = await CodeBlock.findOneAndUpdate(
    { shareId },
    updateFields,
    { new: true }
  );

  if (!updatedFile) {
    return send_response(
      false,
      null,
      "Original file not found",
      StatusCodes.NOT_FOUND
    );
  }

  // Prepare response
  const responseData = {
    shareId: updatedFile.shareId,
    ...(expiresIn && { 
      expiresIn: updatedFile.expiresIn,
      expiresAt: updatedFile.expiresAt 
    }),
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/live/${updatedFile.shareId}`,
  };

  return send_response(
    true,
    responseData,
    "Update successful",
    StatusCodes.OK
  );
});