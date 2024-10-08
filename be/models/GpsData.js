const mongoose = require("mongoose");

const gpsDataSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  timestamp: Date,
  ignition: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("GpsData", gpsDataSchema);
