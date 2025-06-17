import { send_response } from "./apiResponse";

export function asyncHandler(handler) {
  return async function (req, ...args) {
    try {
      return await handler(req, ...args);
    } catch (error) {
      console.error("API Error:", error);
      return send_response(false,null,"Internal Server Error",500)
    }
  };
}
