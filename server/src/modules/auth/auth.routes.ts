import { Router } from "express";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";

const repository = new AuthRepository();
const service = new AuthService(repository);
const controller = new AuthController(service);

export const authRouter = Router();

authRouter.post("/register", controller.register);
authRouter.post("/login", controller.login);
authRouter.get("/me", authMiddleware, controller.me);
