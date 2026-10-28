/* Crear los siguientes modelos. Todos deben usar timestamps: true y versionKey: false.
1. User (Usuario)
● username (String, único, 3-20 caracteres)
● email (String, único, formato válido)
● password (String, hasheada con bcrypt)
● role (String, enum: 'user', 'admin', default: 'user')
● profile (documento embebido, relación 1:1):
○ firstName (String, 2-50 caracteres)
○ lastName (String, 2-50 caracteres)
○ birthDate (Date, opcional)
○ phone (String, opcional)
● deletedAt (Date, default: null)
● Virtual populate events → eventos organizados por el usuario. */

import { model, Schema, Types } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      matchMedia: [/^\S+@\S+\.\S+$/, "Email inválido"],
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profile: {
      firstName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50,
      },
      lastName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50,
      },
      birthDate: {
        type: Date,
        default: null,
      },
      phone: {
        type: String,
        default: null,
      },
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const User = model("User", userSchema);
