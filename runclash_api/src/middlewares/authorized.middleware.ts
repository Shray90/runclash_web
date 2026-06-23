import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/http-error";
import { verifyJwt } from "../utils/jwt";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authorized = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ")
      ? header.slice("Bearer ".length)
      : null;

    if (!token) {
      return next(new HttpError(401, "Unauthorized"));
    }

    const decoded = verifyJwt(token);

    if (!decoded?.id || !decoded?.email || !decoded?.role) {
      return next(new HttpError(401, "Unauthorized"));
    }

    req.user = {
      id: String(decoded.id),
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch {
    return next(new HttpError(401, "Unauthorized"));
  }
};


