import { matchedData } from "express-validator";
import { isValidObjectId } from "mongoose";
import { Event } from "../models/events.model.js";
import { User } from "../models/user.model.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ deletedAt: null })
      .select("-password")
      .populate("events");

    return res.status(200).json({
      msg: "Usuarios obtenidos correctamente",
      data: users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        msg: "ID de usuario inválido",
      });
    }

    const user = await User.findOne({ _id: id, deletedAt: null })
      .select("-password")
      .populate("events");

    if (!user) {
      return res.status(404).json({
        msg: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      msg: "Usuario obtenido correctamente",
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        msg: "ID de usuario inválido",
      });
    }

    const user = await User.findOne({ _id: id, deletedAt: null });

    if (!user) {
      return res.status(404).json({
        msg: "Usuario no encontrado",
      });
    }

    const { username, email, role, profile } = matchedData(req, {
      locations: ["body"],
    });
    const updates = {};

    if (username !== undefined) {
      updates.username = username;
    }

    if (email !== undefined) {
      updates.email = email;
    }

    if (role !== undefined) {
      updates.role = role;
    }

    if (profile !== undefined) {
      for (const field of ["firstName", "lastName", "birthDate", "phone"]) {
        if (profile[field] !== undefined) {
          updates[`profile.${field}`] = profile[field];
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        msg: "No hay datos válidos para actualizar",
      });
    }

    for (const field of ["username", "email"]) {
      if (updates[field] !== undefined) {
        const existingUser = await User.exists({
          [field]: updates[field],
          _id: { $ne: id },
        });

        if (existingUser) {
          return res.status(400).json({
            msg: `El ${field === "username" ? "nombre de usuario" : "email"} ya está registrado`,
          });
        }
      }
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: updates },
      { new: true, runValidators: true },
    )
      .select("-password")
      .populate("events");

    if (!updatedUser) {
      return res.status(404).json({
        msg: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      msg: "Usuario actualizado correctamente",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        msg: "ID de usuario inválido",
      });
    }

    const user = await User.findOne({ _id: id, deletedAt: null });

    if (!user) {
      return res.status(404).json({
        msg: "Usuario no encontrado",
      });
    }

    await Event.deleteMany({ organizer: user._id });
    user.deletedAt = new Date();
    await user.save();

    return res.status(200).json({
      msg: "Usuario eliminado correctamente",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};
