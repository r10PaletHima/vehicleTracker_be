require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const router = require("./routes/auth");
const tripsRoutes = require("./routes/trips");
const auth = require("./middleware/auth");

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/trips", require("./routes/trips"));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
