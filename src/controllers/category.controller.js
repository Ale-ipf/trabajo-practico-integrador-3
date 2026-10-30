import { matchedData } from "express-validator";
import { isValidObjectId } from "mongoose";
import { Category } from "../models/category.model.js";
import { Event } from "../models/events.model.js";

export const createCategory = async (req, res) => {
  try {
    const data = matchedData(req, { locations: ["body"] });

    if (await Category.exists({ name: data.name })) {
      return res.status(400).json({
        msg: "Ya existe una categoría con ese nombre",
      });
    }

    const category = await Category.create(data);

    return res.status(201).json({
      msg: "Categoría creada correctamente",
      data: category,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    return res.status(200).json({
      msg: "Categorías obtenidas correctamente",
      data: categories,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        msg: "ID de categoría inválido",
      });
    }

    const category = await Category.findById(id).populate("events");

    if (!category) {
      return res.status(404).json({
        msg: "Categoría no encontrada",
      });
    }

    return res.status(200).json({
      msg: "Categoría obtenida correctamente",
      data: category,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        msg: "ID de categoría inválido",
      });
    }

    const data = matchedData(req, { locations: ["body"] });

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        msg: "No hay datos válidos para actualizar",
      });
    }

    if (
      data.name &&
      (await Category.exists({ name: data.name, _id: { $ne: id } }))
    ) {
      return res.status(400).json({
        msg: "Ya existe una categoría con ese nombre",
      });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    );

    if (!category) {
      return res.status(404).json({
        msg: "Categoría no encontrada",
      });
    }

    return res.status(200).json({
      msg: "Categoría actualizada correctamente",
      data: category,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        msg: "ID de categoría inválido",
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        msg: "Categoría no encontrada",
      });
    }

    await Event.updateMany(
      { categories: category._id },
      { $pull: { categories: category._id } },
    );
    await category.deleteOne();

    return res.status(200).json({
      msg: "Categoría eliminada correctamente",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};
