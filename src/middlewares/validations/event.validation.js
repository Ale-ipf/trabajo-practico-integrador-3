import { body, param } from "express-validator";

const eventFields = (isUpdate) => {
  const field = (validation) =>
    isUpdate ? validation.optional() : validation;

  return [
    field(
      body("title")
        .isString()
        .withMessage("El título debe ser texto")
        .bail()
        .trim()
        .isLength({ min: 3, max: 150 })
        .withMessage("El título debe tener entre 3 y 150 caracteres"),
    ),
    field(
      body("description")
        .isString()
        .withMessage("La descripción debe ser texto")
        .bail()
        .trim()
        .isLength({ min: 20 })
        .withMessage("La descripción debe tener al menos 20 caracteres"),
    ),
    field(
      body("startDate")
        .isISO8601()
        .withMessage("La fecha de inicio debe ser válida")
        .toDate(),
    ),
    field(
      body("endDate")
        .isISO8601()
        .withMessage("La fecha de finalización debe ser válida")
        .toDate()
        .custom((endDate, { req }) => {
          if (req.body.startDate && endDate <= new Date(req.body.startDate)) {
            throw new Error(
              "La fecha de finalización debe ser posterior al inicio",
            );
          }
          return true;
        }),
    ),
    field(
      body("capacity")
        .isInt({ min: 1 })
        .withMessage("La capacidad debe ser un entero mayor o igual a 1")
        .toInt(),
    ),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("El precio debe ser un número mayor o igual a 0")
      .toFloat(),
    body("status")
      .optional()
      .isIn(["scheduled", "cancelled", "finished"])
      .withMessage("El estado del evento no es válido"),
    field(
      body("location.venue")
        .isString()
        .withMessage("El lugar debe ser texto")
        .bail()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("El lugar debe tener entre 3 y 100 caracteres"),
    ),
    field(
      body("location.address")
        .isString()
        .withMessage("La dirección debe ser texto")
        .bail()
        .trim()
        .isLength({ min: 5, max: 150 })
        .withMessage("La dirección debe tener entre 5 y 150 caracteres"),
    ),
    field(
      body("location.city")
        .isString()
        .withMessage("La ciudad debe ser texto")
        .bail()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("La ciudad debe tener entre 2 y 50 caracteres"),
    ),
    body("categories")
      .optional()
      .isArray()
      .withMessage("Las categorías deben enviarse como un array")
      .bail()
      .custom((categories) =>
        categories.every((id) => /^[0-9a-fA-F]{24}$/.test(String(id))),
      )
      .withMessage("Todas las categorías deben tener un ID válido"),
  ];
};

export const createEventValidation = eventFields(false);

export const updateEventValidation = [
  param("id").isMongoId().withMessage("ID de evento inválido"),
  ...eventFields(true),
];
