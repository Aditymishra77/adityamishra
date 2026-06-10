import type { Request, Response } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  constructor(private readonly service: AuthService) {}

  register = async (request: Request, response: Response): Promise<void> => {
    const token = await this.service.register(request.body);
    response.status(201).json(token);
  };

  login = async (request: Request, response: Response): Promise<void> => {
    const token = await this.service.login(request.body);
    response.status(200).json(token);
  };

  me = async (request: Request, response: Response): Promise<void> => {
    response.status(200).json({ user: request.user });
  };
}
