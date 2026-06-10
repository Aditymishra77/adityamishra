import { Router } from "express";
import type { Request, Response } from "express";

export const healthRouter = Router();

healthRouter.get("/health", (_request: Request, response: Response) => {
  response.status(200).json({ status: "ok" });
});
