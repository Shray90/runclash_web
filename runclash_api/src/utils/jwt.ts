import jwt from "jsonwebtoken";

export type JwtPayload = {
  id: string;
  email: string;
  role: string;
};

export const verifyJwt = (token: string): JwtPayload => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || "gigflow_dev_secret"
  ) as JwtPayload;
};

