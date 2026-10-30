import { body } from "express-validator";

const namePattern = /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u;

const profileValidation = (isUpdate = false) => {
  const field = (validation) =>
    isUpdate ? validation.optional({ nullable: true }) : validation;

  return [
    field(
      body("profile.firstName")
        .isString()
        .withMessage("El nombre debe ser texto")
        .bail()
        .trim()
        .matches(namePattern)
        .withMessage("El nombre solo puede contener letras")
        .bail()
        .isLength({ min: 2, max: 50 })
        .withMessage("El nombre debe tener entre 2 y 50 caracteres"),
    ),
    field(
      body("profile.lastName")
        .isString()
        .withMessage("El apellido debe ser texto")
        .bail()
        .trim()
        .matches(namePattern)
        .withMessage("El apellido solo puede contener letras")
        .bail()
        .isLength({ min: 2, max: 50 })
        .withMessage("El apellido debe tener entre 2 y 50 caracteres"),
    ),
    body("profile.birthDate")
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601()
      .withMessage("La fecha de nacimiento debe ser válida")
      .bail()
      .custom((date) => new Date(date) <= new Date())
      .withMessage("La fecha de nacimiento no puede ser futura")
      .toDate(),
    body("profile.phone")
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .withMessage("El teléfono debe ser texto")
      .bail()
      .matches(/^\d{8,15}$/)
      .withMessage("El teléfono debe tener entre 8 y 15 números"),
  ];
};

export const registerValidation = [
  body("username")
    .isString()
    .withMessage("El nombre de usuario debe ser texto")
    .bail()
    .trim()
    .isAlphanumeric()
    .withMessage("El nombre de usuario solo puede contener letras y números")
    .bail()
    .isLength({ min: 3, max: 20 })
    .withMessage("El nombre de usuario debe tener entre 3 y 20 caracteres"),
  body("email")
    .isEmail()
    .withMessage("El email debe ser válido")
    .bail()
    .normalizeEmail(),
  body("password")
    .isString()
    .withMessage("La contraseña debe ser texto")
    .bail()
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .matches(/[a-z]/)
    .withMessage("La contraseña debe incluir una minúscula")
    .matches(/[A-Z]/)
    .withMessage("La contraseña debe incluir una mayúscula")
    .matches(/\d/)
    .withMessage("La contraseña debe incluir un número"),
  ...profileValidation(),
];

export const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("El email debe ser válido")
    .bail()
    .normalizeEmail(),
  body("password")
    .isString()
    .withMessage("La contraseña es obligatoria")
    .notEmpty()
    .withMessage("La contraseña es obligatoria"),
];

export const updateProfileValidation = profileValidation(true);
