const eventSchema = new Schema({
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
  },
  endDate: {
    type: Date,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
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
      minlength: 3,
      maxlength: 100,
    },
    address: {
      type: String,
      minlength: 5,
      maxlength: 150,
    },
    city: {
      type: String,
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
});

schema.virtual("attendees", {
  ref: "User",
  localField: "_id",
  foreignField: "attendedEvents",
});

schema.virtual("organizerDetails", {
  ref: "User",
  localField: "organizer",
  foreignField: "_id",
  justOne: true,
});
