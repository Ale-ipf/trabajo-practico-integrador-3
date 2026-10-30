import { model, Schema } from "mongoose";

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
    },
    startDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (date) {
          return !this.endDate || date < this.endDate;
        },
        message:
          "La fecha de inicio debe ser anterior a la fecha de finalización",
      },
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (date) {
          return !this.startDate || date > this.startDate;
        },
        message: "La fecha de finalización debe ser posterior al inicio",
      },
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "La capacidad debe ser un número entero",
      },
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["scheduled", "cancelled", "finished"],
      default: "scheduled",
    },
    location: {
      venue: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100,
      },
      address: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 150,
      },
      city: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50,
      },
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

eventSchema.virtual("attendees", {
  ref: "User",
  localField: "_id",
  foreignField: "attendedEvents",
});

eventSchema.virtual("organizerDetails", {
  ref: "User",
  localField: "organizer",
  foreignField: "_id",
  justOne: true,
});

export const Event = model("Event", eventSchema);
