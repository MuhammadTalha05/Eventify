import { Request, Response, NextFunction } from "express";

export default function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err);

  if (res.headersSent) return next(err);

  if (err instanceof Error) {
    return res.status(500).json({ error: err.message });
  }

  res.status(500).json({ error: "Internal Server Error" });
}