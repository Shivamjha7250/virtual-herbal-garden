const mongoose = require("mongoose");
const csv = require("csv-parser");
const fs = require("fs");
require("dotenv").config();

const Plant = require("./models/Plant");

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

const FILE_NAME = "herbal_trees_final.csv"; // ✅ make sure this file is in backend folder
const plants = [];

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err);
    process.exit(1);
  });

// ✅ Check file exists first
if (!fs.existsSync(FILE_NAME)) {
  console.error(`❌ CSV file not found: ${FILE_NAME}`);
  console.error("👉 Put the CSV inside backend folder OR use correct path.");
  process.exit(1);
}

fs.createReadStream(FILE_NAME)
  .on("error", (err) => {
    console.error("❌ ReadStream Error:", err);
    process.exit(1);
  })
  .pipe(csv())
  .on("headers", (headers) => {
    console.log("✅ CSV Headers Found:", headers);
  })
  .on("data", (row) => {
    const commonName = (row["Common Name"] || "").toString().trim();
    if (!commonName) return;

    // ✅ Your CSV has wrong column "Uses...s" sometimes
    const uses = (row["Uses"] || row["Uses...s"] || "").toString().trim();

    const doc = {
      "Common Name": commonName,
      "Scientific Name": (row["Scientific Name"] || "").toString().trim(),
      "Description": (row["Description"] || "").toString().trim(),

      "Uses": uses,
      "Advantages": (row["Advantages"] || "").toString().trim(),
      "Disadvantages": (row["Disadvantages"] || "").toString().trim(),
      "Side Effects": (row["Side Effects"] || "").toString().trim(),
      "Related Plants": (row["Related Plants"] || "").toString().trim(),

      "Image 1": (row["Image 1"] || "").toString().trim(),
      "Image 2": (row["Image 2"] || "").toString().trim(),
      "Image 3": (row["Image 3"] || "").toString().trim(),
      "Image 4": (row["Image 4"] || "").toString().trim(),

      "3D Model Link": (row["3D Model Link"] || "").toString().trim(),

      isApproved: true,
    };

    plants.push(doc);
  })
  .on("end", async () => {
    try {
      console.log(`🌱 Parsed ${plants.length} valid rows. Inserting...`);
      await Plant.deleteMany({});
      await Plant.insertMany(plants);
      console.log(`✅ Inserted ${plants.length} plants successfully!`);
      process.exit(0);
    } catch (err) {
      console.error("❌ Insert Error:", err);
      process.exit(1);
    }
  })
  .on("error", (err) => {
    console.error("❌ CSV Parse Error:", err);
    process.exit(1);
  });
