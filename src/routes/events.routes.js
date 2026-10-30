import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  getMyEvents,
  updateEvent,
} from "../controllers/events.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import {
  createEventValidation,
  updateEventValidation,
} from "../middlewares/validations/event.validation.js";

export const eventRouter = Router();

eventRouter.use("/events", authMiddleware);

eventRouter.post("/events", createEventValidation, validate, createEvent);
eventRouter.get("/events", getAllEvents);
eventRouter.get("/events/my", getMyEvents);
eventRouter.get("/events/:id", getEventById);
eventRouter.put("/events/:id", updateEventValidation, validate, updateEvent);
eventRouter.delete("/events/:id", deleteEvent);
