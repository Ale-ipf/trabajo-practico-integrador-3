import { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^[a-zA-Z0-9]+$/,
        "El nombre de usuario solo puede contener letras y números",
      ],
      minlength: 3,
      maxlength: 20,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Email inválido"],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
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
        match: [
          /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u,
          "El nombre solo puede contener letras",
        ],
        minlength: 2,
        maxlength: 50,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        match: [
          /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u,
          "El apellido solo puede contener letras",
        ],
        minlength: 2,
        maxlength: 50,
        trim: true,
      },
      birthDate: {
        type: Date,
        default: null,
        validate: {
          validator: (date) => date === null || date <= new Date(),
          message: "La fecha de nacimiento no puede ser futura",
        },
      },
      phone: {
        type: String,
        default: null,
        match: [/^\d{8,15}$/, "El teléfono debe tener entre 8 y 15 números"],
      },
    },
    attendedEvents: [
      {
        type: Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.virtual("events", {
  ref: "Event",
  localField: "_id",
  foreignField: "organizer",
});

export const User = model("User", userSchema);
