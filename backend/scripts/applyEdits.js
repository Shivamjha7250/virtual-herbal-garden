require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Plant = require("../models/Plant");

// ✅ JSON path: backend/plant-edits.json
const filePath = path.join(__dirname, "..", "plant-edits.json");

// ✅ mapping: JSON keys -> DB keys (your dataset schema uses space keys)
const toDbKey = (key) => {
  const map = {
    commonName: "Common Name",
    scientificName: "Scientific Name",
    description: "Description",

    medicinalUses: "Uses",
    uses: "Uses",

    advantages: "Advantages",
    disadvantages: "Disadvantages",

    sideEffectsCaution: "Side Effects",
    sideEffects: "Side Effects",

    relatedPlants: "Related Plants",
    threeDModelLink: "3D Model Link",
  };

  return map[key] || key;
};

async function run() {
  try {
    if (!fs.existsSync(filePath)) {
      console.log("❌ plant-edits.json not found at:", filePath);
      process.exit(1);
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const arr = JSON.parse(raw);

    if (!Array.isArray(arr) || arr.length === 0) {
      console.log("❌ JSON empty or invalid array");
      process.exit(1);
    }

    // ✅ connect mongo
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // ✅ take only srNo 16..71
    const items = arr.filter((x) => Number(x.srNo) >= 16 && Number(x.srNo) <= 71);

    if (!items.length) {
      console.log("❌ No items found for srNo 16..71 in JSON");
      process.exit(1);
    }

    // ✅ bulk ops
    const ops = items.map((item) => {
      const update = {};

      for (const [k, v] of Object.entries(item)) {
        // ignore these
        if (k === "srNo" || k === "_id") continue;

        const dbKey = toDbKey(k);

        // relatedPlants array -> string (schema String)
        if (dbKey === "Related Plants" && Array.isArray(v)) {
          update[dbKey] = v.join(", ");
        } else {
          update[dbKey] = v;
        }
      }

      // match by Common Name + Scientific Name (safe)
      const common = item.commonName || item["Common Name"];
      const sci = item.scientificName || item["Scientific Name"];

      return {
        updateOne: {
          filter: { "Common Name": common, "Scientific Name": sci },
          update: { $set: update },
          upsert: false,
        },
      };
    });

    const result = await Plant.bulkWrite(ops, { ordered: false });

    console.log("✅ DONE (16–71)");
    console.log("Matched:", result.matchedCount);
    console.log("Modified:", result.modifiedCount);

    process.exit(0);
  } catch (err) {
    console.error("❌ applyEdits failed:", err);
    process.exit(1);
  }
}

run();
