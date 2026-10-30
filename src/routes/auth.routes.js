import { Router } from "express";
import {
  getProfile,
  login,
  logout,
  register,
  updateProfile,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import {
  loginValidation,
  registerValidation,
  updateProfileValidation,
} from "../middlewares/validations/user.validation.js";

export const authRouter = Router();

authRouter.post("/auth/register", registerValidation, validate, register);
authRouter.post("/auth/login", loginValidation, validate, login);
authRouter.get("/auth/profile", authMiddleware, getProfile);
authRouter.put(
  "/auth/profile",
  authMiddleware,
  updateProfileValidation,
  validate,
  updateProfile,
);
authRouter.post("/auth/logout", authMiddleware, logout);