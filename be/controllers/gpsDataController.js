const csv = require("csv-parser");
const { Readable } = require("stream");
const GpsData = require("../models/GpsData");
const Trip = require("../models/Trip");

exports.uploadCsv = async (req, res) => {
  try {
    console.log("Request file:", req.file);
    console.log("Request user:", req.user);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const results = [];
    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null);

    bufferStream
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        console.log("Parsed CSV data:", results);

        const gpsDataPromises = results.map((row) => {
          return new GpsData({
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude),
            timestamp: new Date(row.timestamp),
            ignition: row.ignition,
            user: req.user.id,
          }).save();
        });

        try {
          const savedGpsData = await Promise.all(gpsDataPromises);

          // Create a new trip
          const newTrip = new Trip({
            user: req.user.id,
            startTime: new Date(results[0].timestamp),
            endTime: new Date(results[results.length - 1].timestamp),
            gpsData: savedGpsData.map((data) => data._id),
          });

          await newTrip.save();

          res.status(200).json({
            message: "CSV data uploaded and trip created successfully",
          });
        } catch (saveError) {
          console.error("Error saving GPS data or creating trip:", saveError);
          res
            .status(500)
            .json({ message: "Error saving GPS data or creating trip" });
        }
      });
  } catch (error) {
    console.error("Error uploading CSV:", error);
    res.status(500).json({ message: "Error uploading CSV data" });
  }
};

exports.getTrips = async (req, res) => {
  try {
    const userId = req.user.id;
    const trips = await Trip.find({ user: userId }).sort({ startTime: -1 });
    res.json(trips);
  } catch (error) {
    console.error("Error retrieving trips:", error);
    res.status(500).json({ message: "Error retrieving trips" });
  }
};

exports.getTripDetails = async (req, res) => {
  try {
    const tripId = req.params.id;
    const trip = await Trip.findById(tripId).populate("gpsData");
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    res.json(trip);
  } catch (error) {
    console.error("Error retrieving trip details:", error);
    res.status(500).json({ message: "Error retrieving trip details" });
  }
};
