import { matchedData } from "express-validator";
import { isValidObjectId } from "mongoose";
import { Category } from "../models/category.model.js";
import { Event } from "../models/events.model.js";

const populateEvent = [
  { path: "organizer", select: "username email profile" },
  { path: "categories" },
];

const categoriesExist = async (categories = []) => {
  const count = await Category.countDocuments({ _id: { $in: categories } });
  return count === new Set(categories.map(String)).size;
};

const canManageEvent = (event, user) =>
  user.role === "admin" || event.organizer.equals(user._id);

export const createEvent = async (req, res) => {
  try {
    const data = matchedData(req, { locations: ["body"] });

    if (await Event.exists({ title: data.title })) {
      return res.status(400).json({ msg: "Ya existe un evento con ese título" });
    }

    if (!(await categoriesExist(data.categories))) {
      return res.status(400).json({ msg: "Una o más categorías no existen" });
    }

    const event = await Event.create({ ...data, organizer: req.user._id });
    await event.populate(populateEvent);

    return res.status(201).json({
      msg: "Evento creado correctamente",
      data: event,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate(populateEvent);

    return res.status(200).json({
      msg: "Eventos obtenidos correctamente",
      data: events,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).populate(
      populateEvent,
    );

    return res.status(200).json({
      msg: "Tus eventos obtenidos correctamente",
      data: events,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ msg: "ID de evento inválido" });
    }

    const event = await Event.findById(id).populate(populateEvent);

    if (!event) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    return res.status(200).json({
      msg: "Evento obtenido correctamente",
      data: event,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ msg: "ID de evento inválido" });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    if (!canManageEvent(event, req.user)) {
      return res.status(403).json({ msg: "No tienes permiso para modificar este evento" });
    }

    const data = matchedData(req, { locations: ["body"] });

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ msg: "No hay datos válidos para actualizar" });
    }

    if (data.categories && !(await categoriesExist(data.categories))) {
      return res.status(400).json({ msg: "Una o más categorías no existen" });
    }

    if (
      data.title &&
      (await Event.exists({ title: data.title, _id: { $ne: id } }))
    ) {
      return res.status(400).json({ msg: "Ya existe un evento con ese título" });
    }

    const startDate = data.startDate ?? event.startDate;
    const endDate = data.endDate ?? event.endDate;

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        msg: "La fecha de finalización debe ser posterior al inicio",
      });
    }

    if (data.location) {
      for (const [field, value] of Object.entries(data.location)) {
        data[`location.${field}`] = value;
      }
      delete data.location;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    ).populate(populateEvent);

    return res.status(200).json({
      msg: "Evento actualizado correctamente",
      data: updatedEvent,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ msg: "ID de evento inválido" });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    if (!canManageEvent(event, req.user)) {
      return res.status(403).json({ msg: "No tienes permiso para eliminar este evento" });
    }

    await event.deleteOne();

    return res.status(200).json({ msg: "Evento eliminado correctamente" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};
