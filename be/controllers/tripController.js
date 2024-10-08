const Trip = require("../models/Trip");
const GpsData = require("../models/GpsData");
const calculations = require("../utils/calculations");

exports.getTrips = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    let query = { user: req.user.id };
    if (startDate && endDate) {
      query.startTime = { $gte: startDate, $lte: endDate };
    }

    const trips = await Trip.find(query)
      .sort({ startTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Add summary data
    const tripsWithSummary = await Promise.all(
      trips.map(async (trip) => {
        const firstGpsPoint = await GpsData.findById(trip.gpsData[0]);
        const lastGpsPoint = await GpsData.findById(
          trip.gpsData[trip.gpsData.length - 1]
        );

        if (firstGpsPoint && lastGpsPoint) {
          const distance = calculations.calculateDistance(
            firstGpsPoint,
            lastGpsPoint
          );
          const avgSpeed = calculations.calculateAverageSpeed(trip);

          return {
            ...trip,
            summary: {
              distance,
              avgSpeed,
              startPoint: {
                lat: firstGpsPoint.latitude,
                lng: firstGpsPoint.longitude,
              },
              endPoint: {
                lat: lastGpsPoint.latitude,
                lng: lastGpsPoint.longitude,
              },
            },
          };
        } else {
          return trip; // Return the trip without summary if GPS points are missing
        }
      })
    );

    const total = await Trip.countDocuments(query);

    res.json({
      trips: tripsWithSummary,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.uploadTrip = async (req, res) => {
  try {
    const { coordinates } = req.body;
    const stats = calculateTripStats(coordinates);

    const trip = new Trip({
      user: req.user.id,
      name: req.body.name,
      date: req.body.date,
      coordinates,
      ...stats,
    });

    await trip.save();
    res.status(201).json(trip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTripDetails = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    res.json(trip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
