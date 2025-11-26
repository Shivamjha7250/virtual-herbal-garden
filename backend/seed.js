const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Plant = require('./models/Plant');

// Environment variables configure
dotenv.config();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// 🧠 Smart Categorization Logic
// Yeh map plant ke naam ke hisaab se sahi 'Uses' assign karega
const categoryMap = {
  "Tulsi": ["Immunity", "Respiratory", "Cough & Cold"],
  "Neem": ["Skin Care", "Blood Purification", "Antibacterial"],
  "Aloe Vera": ["Skin Care", "Digestion", "Healing"],
  "Ashwagandha": ["Stress", "Immunity", "Energy"],
  "Turmeric": ["Immunity", "Skin Care", "Inflammation"],
  "Ginger": ["Digestion", "Respiratory", "Anti-inflammatory"],
  "Amla": ["Immunity", "Hair Care", "Digestion"],
  "Giloy": ["Immunity", "Fever", "Detox"],
  "Arjuna": ["Heart Health", "Blood Pressure"],
  "Brahmi": ["Memory", "Stress", "Mental Health"],
  "Shatavari": ["Women's Health", "Immunity"],
  "Moringa": ["Energy", "Joint Pain", "Nutrition"],
  "Peppermint": ["Digestion", "Respiratory", "Cooling"],
  "Clove": ["Oral Health", "Pain Relief"],
  "Hibiscus": ["Hair Care", "Heart Health"],
  "Sandalwood": ["Skin Care", "Cooling"],
  "Bhringraj": ["Hair Care", "Liver Health"],
  "Isabgol": ["Digestion", "Constipation"],
  "Karela": ["Diabetes", "Blood Sugar"],
  "Jamun": ["Diabetes", "Digestion"],
  "Garlic": ["Heart Health", "Immunity"],
  "Fenugreek": ["Diabetes", "Hair Care"],
  "Cardamom": ["Digestion", "Oral Health"]
};

const importData = async () => {
  try {
    const dataPath = path.join(__dirname, 'data', 'AYUSH_top50_with_images.json');
    const jsonData = fs.readFileSync(dataPath, 'utf-8');
    const rawPlants = JSON.parse(jsonData);

    const plantsToInsert = rawPlants.map(p => {
      // Logic: Agar hamare map mein plant ka naam hai, toh wahi categories use karo
      // Nahi toh purana wala use karo, ya default "General Health"
      let smartUses = categoryMap[p.name] || p.uses;
      
      // Ensure karein ki ye array hi ho
      if (!Array.isArray(smartUses)) {
        smartUses = [smartUses];
      }
      
      // Agar array khali hai ya sirf generic hai, toh default category add kar do
      if (smartUses.length === 0 || smartUses[0] === "General health") {
         // Thoda smart guess description se
         if (p.description.toLowerCase().includes("skin")) smartUses.push("Skin Care");
         if (p.description.toLowerCase().includes("stomach") || p.description.includes("digest")) smartUses.push("Digestion");
         if (p.description.toLowerCase().includes("heart")) smartUses.push("Heart Health");
      }

      return {
        name: p.name,
        botanicalName: p.botanicalName,
        description: p.description,
        uses: smartUses, // ✅ Updated Uses
        region: p.region,
        partUsed: Array.isArray(p.partsUsed) ? p.partsUsed.join(', ') : p.partsUsed,
        images: p.imageURL ? [p.imageURL] : [],
        video: "",
        model3D: "",
        category: "Medicinal",
        sideEffects: "Consult a doctor before use."
      };
    });

    await Plant.deleteMany();
    console.log('🗑️  Old data removed');

    await Plant.insertMany(plantsToInsert);
    console.log('🌱 Smart Data Imported Successfully!');

    process.exit();
  } catch (error) {
    console.error('❌ Error with data import:', error);
    process.exit(1);
  }
};

importData();