const fs = require("fs");
const path = require("path");
const axios = require("axios");

const IMAGE_DIR = path.join(__dirname, "images");
const MISSING_FILE = path.join(__dirname, "missing_images.json");

const TIMEOUT_MS = 30000;
const PER_ITEM_DELAY_MS = 1200;

// ✅ USER AGENT (FIXED WITH YOUR EMAIL)
const USER_AGENT =
  "VirtualHerbalGardenBot/1.0 (contact: back2tocampus@gmail.com) Node.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function safeName(str) {
  return String(str || "")
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 60) || "plant";
}

function extFromContentType(ct) {
  const c = (ct || "").toLowerCase();
  if (c.includes("image/jpeg")) return ".jpg";
  if (c.includes("image/png")) return ".png";
  if (c.includes("image/webp")) return ".webp";
  if (c.includes("image/gif")) return ".gif";
  return "";
}

function fileAlreadyExists(baseOutName) {
  return fs.readdirSync(IMAGE_DIR).some((f) => f.startsWith(baseOutName + "."));
}

// ===== Wikipedia API Helper (with User-Agent) =====
async function wikiGET(params) {
  const url = "https://en.wikipedia.org/w/api.php";
  const r = await axios.get(url, {
    params,
    timeout: TIMEOUT_MS,
    headers: {
      "User-Agent": USER_AGENT,
      "Accept": "application/json",
    },
    validateStatus: () => true,
  });

  if (r.status !== 200) {
    const msg =
      typeof r.data === "string"
        ? r.data.slice(0, 200)
        : JSON.stringify(r.data).slice(0, 200);
    throw new Error(`Wikipedia API HTTP ${r.status}: ${msg}`);
  }

  return r.data;
}

async function pickBestTitle(plantName) {
  const data = await wikiGET({
    action: "query",
    list: "search",
    format: "json",
    srlimit: 8,
    srsearch: `${plantName} plant`,
  });

  const results = data?.query?.search || [];
  if (!results.length) return "";

  const p = plantName.toLowerCase();
  const score = (t, snippet = "") => {
    const text = (t + " " + snippet).toLowerCase();
    let s = 0;
    if (text.includes(p)) s += 3;
    if (text.includes("plant")) s += 2;
    if (text.includes("seed")) s += 1;
    if (text.includes("herb")) s += 1;
    if (text.includes("species")) s += 1;
    if (text.includes("genus")) s += 1;
    if (text.includes("botanical")) s += 1;
    if (text.includes("puja") || text.includes("festival") || text.includes("person")) s -= 4;
    return s;
  };

  results.sort((a, b) => score(b.title, b.snippet) - score(a.title, a.snippet));
  return results[0].title;
}

async function getPageThumbnail(title) {
  const data = await wikiGET({
    action: "query",
    format: "json",
    prop: "pageimages",
    pithumbsize: 1200,
    titles: title,
  });

  const pages = data?.query?.pages || {};
  const key = Object.keys(pages)[0];
  const page = pages[key];
  return page?.thumbnail?.source || "";
}

async function getFirstPageImage(title) {
  const data = await wikiGET({
    action: "query",
    format: "json",
    prop: "images",
    imlimit: 10,
    titles: title,
  });

  const pages = data?.query?.pages || {};
  const key = Object.keys(pages)[0];
  const page = pages[key];
  const imgs = page?.images || [];

  const file = imgs
    .map((x) => x.title)
    .find((t) => t && t.startsWith("File:") && !/logo|icon|svg/i.test(t));

  if (!file) return "";

  const info = await wikiGET({
    action: "query",
    format: "json",
    prop: "imageinfo",
    iiprop: "url",
    titles: file,
  });

  const pages2 = info?.query?.pages || {};
  const key2 = Object.keys(pages2)[0];
  const page2 = pages2[key2];
  return page2?.imageinfo?.[0]?.url || "";
}

// ===== Image Download (with User-Agent) =====
async function downloadImage(url) {
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: TIMEOUT_MS,
    headers: { "User-Agent": USER_AGENT },
    validateStatus: (s) => s >= 200 && s < 300,
  });

  return {
    buffer: Buffer.from(res.data),
    contentType: res.headers["content-type"] || "",
  };
}

// ===== MAIN =====
(async () => {
  if (!fs.existsSync(IMAGE_DIR)) fs.mkdirSync(IMAGE_DIR, { recursive: true });

  if (!fs.existsSync(MISSING_FILE)) {
    console.log("❌ missing_images.json not found. Run: node checkMissingImages.js");
    process.exit(1);
  }

  const missing = JSON.parse(fs.readFileSync(MISSING_FILE, "utf-8"));
  console.log(`🧾 Missing items: ${missing.length}`);

  let ok = 0;
  let fail = 0;

  for (let i = 0; i < missing.length; i++) {
    const { plant, file } = missing[i];

    const plantSafe = safeName(plant);
    const slotMatch = String(file).match(/_(\d+)\.(jpg|jpeg|png|webp|gif)$/i);
    const slot = slotMatch ? slotMatch[1] : "1";

    const baseOutName = `${plantSafe}_${slot}`;
    if (fileAlreadyExists(baseOutName)) {
      console.log(`⏭️ Exists: ${baseOutName}.*`);
      continue;
    }

    console.log(`\n🌿 [${i + 1}/${missing.length}] ${plant} -> ${baseOutName}.*`);

    try {
      const title = await pickBestTitle(plant);
      if (!title) throw new Error("No Wikipedia title");

      let imgUrl = await getPageThumbnail(title);
      if (!imgUrl) imgUrl = await getFirstPageImage(title);
      if (!imgUrl) throw new Error(`No image found on page: ${title}`);

      const { buffer, contentType } = await downloadImage(imgUrl);
      const ext =
        extFromContentType(contentType) ||
        path.extname(imgUrl.split("?")[0]) ||
        ".jpg";

      fs.writeFileSync(path.join(IMAGE_DIR, `${baseOutName}${ext}`), buffer);
      console.log(`✅ Saved: ${baseOutName}${ext} (from ${title})`);
      ok++;
    } catch (e) {
      console.log(`❌ Failed: ${baseOutName} -> ${e.message}`);
      fail++;
    }

    await sleep(PER_ITEM_DELAY_MS);
  }

  console.log("\n============================");
  console.log("🎉 DONE");
  console.log("✅ Downloaded:", ok);
  console.log("❌ Still failed:", fail);
  console.log("============================");
})();
