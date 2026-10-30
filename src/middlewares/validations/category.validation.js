import { body, param } from "express-validator";

export const createCategoryValidation = [
  body("name")
    .isString()
    .withMessage("El nombre debe ser texto")
    .bail()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage("El nombre debe tener entre 2 y 30 caracteres"),
  body("description")
    .optional()
    .isString()
    .withMessage("La descripción debe ser texto")
    .bail()
    .trim()
    .isLength({ max: 200 })
    .withMessage("La descripción no puede superar los 200 caracteres"),
];

export const updateCategoryValidation = [
  param("id").isMongoId().withMessage("ID de categoría inválido"),
  body("name")
    .optional()
    .isString()
    .withMessage("El nombre debe ser texto")
    .bail()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage("El nombre debe tener entre 2 y 30 caracteres"),
  body("description")
    .optional()
    .isString()
    .withMessage("La descripción debe ser texto")
    .bail()
    .trim()
    .isLength({ max: 200 })
    .withMessage("La descripción no puede superar los 200 caracteres"),
];
