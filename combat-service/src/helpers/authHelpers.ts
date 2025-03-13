import jwt from "jsonwebtoken";

export const getUserIdFromToken = async (token: string) => {
  try {
    const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET);
    return decodedToken.userId;
  } catch (error) {
    throw new Error("Error decoding token: " + error.message);
  }
};
