import { NextResponse } from "next/server";
export function send_response(success, data = null, message = "", statusCode = 500) {
  const responseData = {
    success,
    data,
    message,
    status: statusCode,
  };

  const validStatusCode =
    Number.isInteger(statusCode) && statusCode >= 200 && statusCode <= 599 ? statusCode : 500;

  return NextResponse.json(responseData, {
    status: validStatusCode
  });
}
