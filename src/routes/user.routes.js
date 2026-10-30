import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "../controllers/user.controller.js";
import {
  adminMiddleware,
  authMiddleware,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import {
  updateUserValidation,
  userIdValidation,
} from "../middlewares/validations/user.validation.js";

export const userRouter = Router();

userRouter.use("/users", authMiddleware, adminMiddleware);

userRouter.get("/users", getAllUsers);

userRouter.get("/users/:id", userIdValidation, validate, getUserById);

userRouter.put("/users/:id", updateUserValidation, validate, updateUser);

userRouter.delete("/users/:id", userIdValidation, validate, deleteUser);