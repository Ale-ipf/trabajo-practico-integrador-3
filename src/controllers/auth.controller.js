import { matchedData } from "express-validator";
import { User } from "../models/user.model.js";
import { comparePassword, hashPassword } from "../helpers/bcrypt.helper.js";
import { generateToken } from "../helpers/jwt.helper.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};

export const register = async (req, res) => {
  try {
    const { username, email, password, profile } = matchedData(req, {
      locations: ["body"],
    });

    const existingUser = await User.exists({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        msg: "El nombre de usuario o email ya está registrado",
      });
    }

    const user = await User.create({
      username,
      email,
      password: await hashPassword(password),
      profile,
    });
    const userData = user.toObject();
    delete userData.password;

    return res.status(201).json({
      msg: "Usuario registrado correctamente",
      data: userData,
    });
  } catch (error) {
    console.log(error);

    if (error.code === 11000 || error.name === "ValidationError") {
      return res.status(400).json({
        msg: "No se pudo registrar el usuario con esos datos",
      });
    }

    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = matchedData(req, { locations: ["body"] });
    const user = await User.findOne({ email, deletedAt: null }).select(
      "+password",
    );

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({
        msg: "Email o contraseña incorrectos",
      });
    }

    const token = generateToken(user._id);
    const userData = user.toObject();
    delete userData.password;

    return res
      .cookie("token", token, cookieOptions)
      .status(200)
      .json({
        msg: "Inicio de sesión correcto",
        data: userData,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      msg: "Perfil obtenido correctamente",
      data: req.user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const profileData = matchedData(req, { locations: ["body"] }).profile;

    if (!profileData || Object.keys(profileData).length === 0) {
      return res.status(400).json({
        msg: "No hay datos válidos para actualizar",
      });
    }

    const updates = {};

    for (const [field, value] of Object.entries(profileData)) {
      updates[`profile.${field}`] = value;
    }

    const user = await User.findOneAndUpdate(
      { _id: req.user._id, deletedAt: null },
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        msg: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      msg: "Perfil actualizado correctamente",
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const logout = async (req, res) => {
  try {
    return res
      .clearCookie("token", cookieOptions)
      .status(200)
      .json({
        msg: "Sesión cerrada correctamente",
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};
