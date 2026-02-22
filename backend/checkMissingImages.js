const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const CSV_FILE = "herbal_trees_final.csv";
const IMAGES_DIR = path.join(__dirname, "images");

const missing = [];

fs.createReadStream(CSV_FILE)
  .pipe(csv())
  .on("data", (row) => {
    const plantName = row["Common Name"] || "";
    const files = [row["Image 1"], row["Image 2"], row["Image 3"], row["Image 4"]]
      .map((x) => (x || "").trim())
      .filter(Boolean);

    for (const f of files) {
      const p = path.join(IMAGES_DIR, f);
      if (!fs.existsSync(p)) {
        missing.push({ plant: plantName, file: f });
      }
    }
  })
  .on("end", () => {
    console.log(` Missing files: ${missing.length}`);
    console.table(missing.slice(0, 25));
    fs.writeFileSync("missing_images.json", JSON.stringify(missing, null, 2));
    console.log(" Saved: missing_images.json");
  });
