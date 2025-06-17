import { send_response } from "@/utils/apiResponse";
import { User } from "@/models/User";

export const generateAccessAndRefreshTokens = async (user_id) => {
  try {
    
    const user = await User.findById(user_id);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error(error);
  }
};