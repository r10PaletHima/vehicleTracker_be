const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    gpsData: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GpsData",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", TripSchema);
