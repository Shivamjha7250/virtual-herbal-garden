const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const https = require("https");
const http = require("http");
const gis = require("g-i-s");

const CSV_FILE = "herbal_trees_70_working.csv";
const IMAGE_DIR = path.join(__dirname, "images");

if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}


function safeName(str) {
  return String(str || "")
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 60) || "plant";
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function searchImages(query) {
  return new Promise((resolve, reject) => {
    gis(query, (error, results) => {
      if (error) return reject(error);
      resolve(results.slice(0, 4)); 
    });
  });
}

function downloadToFile(url, filePath) {
  return new Promise((resolve, reject) => {
    if (!url || !url.startsWith("http")) return reject(new Error("Invalid URL"));
    
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve(downloadToFile(res.headers.location, filePath));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const file = fs.createWriteStream(filePath);
      res.pipe(file);
      file.on("finish", () => { file.close(resolve); });
      file.on("error", (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    });
    req.on("error", reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

(async () => {
  const rows = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_FILE)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("error", reject)
      .on("end", resolve);
  });

  console.log(` CSV Loaded: ${rows.length} plants found.`);
  console.log(" Searching and downloading images directly from Google...");

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = safeName(row["Common Name"] || `plant_${i + 1}`);
    const searchTerm = `${row["Common Name"]} plant`;

    console.log(`\n [${i + 1}/${rows.length}] Processing: ${name}...`);

    try {
      const results = await searchImages(searchTerm);
      
      if (results.length === 0) {
        console.log(` No images found for ${name}`);
        continue;
      }

      const downloadPromises = results.map((imgData, index) => {
        const ext = path.extname(imgData.url).split("?")[0] || ".jpg";
        const filename = `${name}_${index + 1}${ext}`;
        const filePath = path.join(IMAGE_DIR, filename);

        return downloadToFile(imgData.url, filePath)
          .then(() => console.log(`   Saved: ${filename}`))
          .catch((err) => console.log(`  Failed (${filename}): ${err.message}`));
      });

      await Promise.all(downloadPromises);

    } catch (err) {
      console.error(` Search Failed for ${name}:`, err.message);
    }

    await sleep(2000); 
  }

  console.log("\n ALL DONE!");
})();