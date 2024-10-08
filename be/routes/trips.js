const express = require("express");
const router = express.Router();
const {
  getTrips,
  uploadTrip,
  getTripDetails,
  uploadExcel,
} = require("../controllers/tripController");
const auth = require("../middleware/auth");
const { upload, parseCSV } = require("../middleware/upload");
const multer = require("multer");

const gpsDataController = require("../controllers/gpsDataController");

// If you already have a multer configuration, use that instead of creating a new one
// Otherwise, you can use this configuration
const csvUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv") {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"), false);
    }
  },
});

// Make sure gpsDataController.uploadCsv is defined
console.log("uploadCsv function:", gpsDataController.uploadCsv);

router.post(
  "/upload-csv",
  auth,
  csvUpload.single("file"),
  gpsDataController.uploadCsv
);

router.get("/", auth, getTrips);
router.get("/:id", auth, getTripDetails);

module.exports = router;
