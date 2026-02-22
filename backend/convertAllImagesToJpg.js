const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const IMAGES_DIR = path.join(__dirname, "images");

const SUPPORTED = [".webp", ".png", ".jpeg", ".jpg"];

(async () => {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.log(" images folder not found!");
    return;
  }

  const files = fs.readdirSync(IMAGES_DIR);

  const imageFiles = files.filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return SUPPORTED.includes(ext);
  });

  console.log(`Found ${imageFiles.length} images`);

  let converted = 0;
  let skipped = 0;

  for (const file of imageFiles) {
    const ext = path.extname(file).toLowerCase();
    const baseName = path.basename(file, ext);

    const inputPath = path.join(IMAGES_DIR, file);
    const outputPath = path.join(IMAGES_DIR, `${baseName}.jpg`);

    if (ext === ".jpg") {
      skipped++;
      continue;
    }

    if (fs.existsSync(outputPath)) {
      skipped++;
      continue;
    }

    try {
      await sharp(inputPath)
        .jpeg({ quality: 85 })
        .toFile(outputPath);

      converted++;
      console.log(` ${file} → ${baseName}.jpg`);
    } catch (err) {
      console.log(` Failed: ${file}`, err.message);
    }
  }

  console.log("\n==============================");
  console.log(` Conversion Done`);
  console.log(` Converted: ${converted}`);
  console.log(` Skipped: ${skipped}`);
  console.log("==============================");
})();
