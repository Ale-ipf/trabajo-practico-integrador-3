import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "../controllers/category.controller.js";
import {
  adminMiddleware,
  authMiddleware,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import {
  createCategoryValidation,
  updateCategoryValidation,
} from "../middlewares/validations/category.validation.js";

export const categoryRouter = Router();

categoryRouter.use("/categories", authMiddleware);

categoryRouter.post(
  "/categories",
  adminMiddleware,
  createCategoryValidation,
  validate,
  createCategory,
);
categoryRouter.get("/categories", getAllCategories);
categoryRouter.get("/categories/:id", getCategoryById);
categoryRouter.put(
  "/categories/:id",
  adminMiddleware,
  updateCategoryValidation,
  validate,
  updateCategory,
);
categoryRouter.delete("/categories/:id", adminMiddleware, deleteCategory);
