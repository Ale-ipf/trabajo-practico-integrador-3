import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;
  const token =
    req.cookies?.token ??
    (authorization?.startsWith("Bearer ") ? authorization.slice(7) : null);

  if (!token) {
    return res.status(401).json({
      msg: "Se requiere autenticación",
    });
  }

  if (!process.env.JWT_SECRET) {
    console.log("JWT_SECRET no está configurado");
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({
      msg: "El token es inválido o expiró",
    });
  }

  const userId =
    typeof payload === "object" &&
    (payload.userId ?? payload.id ?? payload.sub);

  if (!userId) {
    return res.status(401).json({
      msg: "El token no contiene un usuario válido",
    });
  }

  try {
    const user = await User.findOne({ _id: userId, deletedAt: null }).select(
      "-password",
    );

    if (!user) {
      return res.status(401).json({
        msg: "El usuario autenticado no está disponible",
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      msg: "Se requieren permisos de administrador",
    });
  }

  return next();
};
