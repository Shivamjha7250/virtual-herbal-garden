const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { createObjectCsvWriter } = require("csv-writer");

const OLD_CSV_FILE = "herbal_trees_70_working.csv";
const NEW_CSV_FILE = "herbal_trees_final.csv"; // ✅ This new file will be created

// Same helper function used while downloading images (Windows-safe filename)
function safeName(str) {
  return (
    String(str || "")
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "") // remove illegal filename chars
      .replace(/\s+/g, "_")
      .slice(0, 60) || "plant"
  );
}

(async () => {
  const rows = [];

  // 1) Read the old CSV file
  await new Promise((resolve, reject) => {
    fs.createReadStream(OLD_CSV_FILE)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("error", reject)
      .on("end", resolve);
  });

  console.log(`📄 Updating ${rows.length} rows...`);

  // 2) Update each row:
  // Replace Image 1..4 URLs with local filenames (e.g., Tulsi_1.jpg)
  const updatedRows = rows.map((row) => {
    const name = safeName(row["Common Name"]);

    return {
      ...row, // keep all other columns the same (Description, Uses, etc.)
      "Image 1": `${name}_1.jpg`,
      "Image 2": `${name}_2.jpg`,
      "Image 3": `${name}_3.jpg`,
      "Image 4": `${name}_4.jpg`,
    };
  });

  // 3) Save the updated data into a new CSV file
  const headers = Object.keys(updatedRows[0]).map((key) => ({
    id: key,
    title: key,
  }));

  const csvWriter = createObjectCsvWriter({
    path: NEW_CSV_FILE,
    header: headers,
  });

  await csvWriter.writeRecords(updatedRows);

  console.log(`\n✅ Success! New file created: ${NEW_CSV_FILE}`);
  console.log("👉 Now use 'herbal_trees_final.csv' in your app/seed script.");
})();
