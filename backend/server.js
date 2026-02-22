require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./db");


const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");

const plantRoutes = require("./routes/plants"); 

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/images", express.static(path.join(__dirname, "images")));

connectDB();

app.get("/", (req, res) => {
  res.send("Virtual Herbal Garden - Backend is running");
});

app.use("/api/plants", plantRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(500).json({ error: err.message || "Server Error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
