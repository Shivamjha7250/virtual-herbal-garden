const fs = require("fs");
const path = require("path");
require("dotenv").config();
const mongoose = require("mongoose");
const Plant = require("./models/Plant");

const IMAGES_DIR = path.join(__dirname, "images");

const normalize = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_().-]/g, "");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB Connected");

  // Read all files from images folder
  const files = fs.existsSync(IMAGES_DIR) ? fs.readdirSync(IMAGES_DIR) : [];
  const fileSet = new Set(files);

  const plants = await Plant.find({});
  console.log(`🌿 Plants in DB: ${plants.length}`);
  console.log(`🖼️ Files in images/: ${files.length}`);

  let updated = 0;

  for (const plant of plants) {
    const name = plant["Common Name"];
    const base = normalize(name);

    // Try to find best match file for each slot
    const findFile = (slot) => {
      // expected: base_1.jpg
      const expected = `${base}_${slot}.jpg`;

      // exact match
      if (fileSet.has(expected)) return expected;

      // try other extensions
      const exts = ["jpg", "jpeg", "png", "webp"];
      for (const ext of exts) {
        const alt = `${base}_${slot}.${ext}`;
        if (fileSet.has(alt)) return alt;
      }

      // try startsWith (handles " (1)" etc.)
      const prefix = `${base}_${slot}`;
      const match = files.find((f) => normalize(f).startsWith(prefix));
      return match || "";
    };

    const i1 = findFile(1);
    const i2 = findFile(2);
    const i3 = findFile(3);
    const i4 = findFile(4);

    const before = `${plant["Image 1"]}|${plant["Image 2"]}|${plant["Image 3"]}|${plant["Image 4"]}`;
    const after = `${i1}|${i2}|${i3}|${i4}`;

    if (before !== after) {
      plant["Image 1"] = i1 || plant["Image 1"];
      plant["Image 2"] = i2 || plant["Image 2"];
      plant["Image 3"] = i3 || plant["Image 3"];
      plant["Image 4"] = i4 || plant["Image 4"];
      await plant.save();
      updated++;
      console.log(`✅ Updated: ${name}`);
    }
  }

  console.log(`\n🎉 DONE! Updated plants: ${updated}`);
  process.exit(0);
})();
