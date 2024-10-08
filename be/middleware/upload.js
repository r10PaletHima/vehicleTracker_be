const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

const parseCSV = (req, res, next) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      req.body.coordinates = results.map((row) => ({
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
        timestamp: new Date(row.timestamp),
        ignition: row.ignition === "true",
      }));
      fs.unlinkSync(req.file.path);
      next();
    });
};

module.exports = { upload, parseCSV };
