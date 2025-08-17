import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";

export interface AuthRequest extends Request {
  user?: { sub: string; role?: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) 
    return res.status(401).json({ error: "Unauthorized" });

  const token = h.split(" ")[1];
  try {
    const payload = verifyAccessToken<{ sub: string; role?: string }>(token);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
