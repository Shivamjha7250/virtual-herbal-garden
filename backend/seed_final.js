const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Plant = require('./models/Plant');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => { console.error(err); process.exit(1); });

const plantsData = [
  {
    name: "Tulsi",
    botanicalName: "Ocimum tenuiflorum",
    category: "Immunity",
    description: "Tulsi, or Holy Basil, is a sacred plant in Hinduism and a powerhouse of medicinal properties.",
    region: "India",
    partsUsed: "Leaves, Seeds", // ✅ Asli Data
    uses: ["Immunity Booster", "Cough & Cold", "Stress Relief"],
    advantages: ["Natural Detoxifier", "Anti-bacterial", "Good for Heart"],
    disadvantages: ["Can thin the blood", "Avoid before surgery"],
    sideEffects: "Excessive chewing may damage teeth enamel.",
    images: ["/images/Tulsi.jpg"],
    selected3DImageIndex: 0
  },
  {
    name: "Neem",
    botanicalName: "Azadirachta indica",
    category: "Skin Care",
    description: "Neem is a tree native to the Indian subcontinent. Every part of the tree is used in traditional medicine.",
    region: "Tropical India",
    partsUsed: "Leaves, Bark, Oil", // ✅ Asli Data
    uses: ["Acne Treatment", "Blood Purifier", "Dental Health"],
    advantages: ["Cures Acne", "Anti-fungal", "Detoxifies Body"],
    disadvantages: ["Very bitter taste", "Not safe for infants"],
    sideEffects: "Large doses can cause stomach upset.",
    images: ["/images/Neem.jpg"],
    selected3DImageIndex: 0
  },
  {
    name: "Aloe Vera",
    botanicalName: "Aloe barbadensis miller",
    category: "Skin Care",
    description: "Aloe Vera is a succulent plant species widely used in the cosmetic and pharmaceutical industries.",
    region: "Global (Tropical)",
    partsUsed: "Gel (Leaf Pulp)", // ✅ Asli Data
    uses: ["Skin Moisturizer", "Digestion", "Wound Healing"],
    advantages: ["Soothes Sunburn", "Hydrates Skin", "Relieves Constipation"],
    disadvantages: ["Latex part can cause cramps", "Lowers blood sugar"],
    sideEffects: "Avoid consuming latex part directly.",
    images: ["/images/Aloe_Vera.jpg"],
    selected3DImageIndex: 0
  },
  {
    name: "Ashwagandha",
    botanicalName: "Withania somnifera",
    category: "General health",
    description: "Ashwagandha is an adaptogen that helps the body manage stress and boosts brain function.",
    region: "India, Middle East",
    partsUsed: "Roots, Leaves", // ✅ Asli Data
    uses: ["Stress Management", "Muscle Growth", "Energy"],
    advantages: ["Reduces Anxiety", "Boosts Testosterone", "Improves Memory"],
    disadvantages: ["May cause drowsiness", "Heat-inducing"],
    sideEffects: "Large doses may cause diarrhea.",
    images: ["/images/Ashwagandha.jpg"],
    selected3DImageIndex: 0
  },
  {
    name: "Giloy",
    botanicalName: "Tinospora cordifolia",
    category: "Immunity",
    description: "Giloy is an Ayurvedic herb used for ages to boost immunity and treat chronic fever.",
    region: "India",
    partsUsed: "Stem", // ✅ Asli Data
    uses: ["Chronic Fever", "Immunity", "Diabetes"],
    advantages: ["Anti-inflammatory", "Improves Digestion", "Reduces Asthma"],
    disadvantages: ["Can cause constipation", "Lowers blood sugar"],
    sideEffects: "Auto-immune disease patients should avoid.",
    images: ["/images/Giloy.jpg"],
    selected3DImageIndex: 0
  },
  {
    name: "Amla",
    botanicalName: "Phyllanthus emblica",
    category: "General health",
    description: "Amla is the richest natural source of Vitamin C, essential for hair and skin health.",
    region: "India",
    partsUsed: "Fruit", // ✅ Asli Data
    uses: ["Hair Care", "Immunity", "Digestion"],
    advantages: ["Anti-aging", "Metabolism Boost", "Blood Purifier"],
    disadvantages: ["Can cause acidity", "Dry skin if excess"],
    sideEffects: "May trigger hyperacidity.",
    images: ["/images/Amla.jpg"],
    selected3DImageIndex: 0
  },
  {
    name: "Arjuna",
    botanicalName: "Terminalia arjuna",
    category: "Heart Health",
    description: "The bark of the Arjuna tree is a famous heart tonic in Ayurveda.",
    region: "River banks of India",
    partsUsed: "Bark", // ✅ Asli Data
    uses: ["Heart Failure", "High BP", "Cholesterol"],
    advantages: ["Strengthens heart muscles", "Improves blood flow"],
    disadvantages: ["May lower blood sugar", "Mild gastric issues"],
    sideEffects: "Nausea in rare cases.",
    images: ["/images/Arjuna.jpg"],
    selected3DImageIndex: 0
  },
  {
    name: "Ajwain",
    botanicalName: "Trachyspermum ammi",
    category: "Digestion",
    description: "Carom seeds are a household remedy for indigestion and gas.",
    region: "India",
    partsUsed: "Seeds", // ✅ Asli Data
    uses: ["Gas & Bloating", "Indigestion", "Cold"],
    advantages: ["Instant gas relief", "Antibacterial"],
    disadvantages: ["Increases body heat", "Avoid in mouth ulcers"],
    sideEffects: "Heartburn if consumed in excess.",
    images: ["/images/Ajwain.jpg"],
    selected3DImageIndex: 0
  },
  {
    name: "Vasaka",
    botanicalName: "Adhatoda vasica",
    category: "Respiratory",
    description: "Vasaka is a potent herb for managing respiratory ailments like asthma.",
    region: "India",
    partsUsed: "Leaves", // ✅ Asli Data
    uses: ["Asthma", "Bronchitis", "Excess Mucus"],
    advantages: ["Clears lungs", "Relieves cough"],
    disadvantages: ["Not safe for pregnancy", "High doses cause vomiting"],
    sideEffects: "Nausea if taken in excess.",
    images: ["/images/Vasaka.jpg"],
    selected3DImageIndex: 0
  }
];

const seedDB = async () => {
  try {
    await Plant.deleteMany({});
    console.log('🗑️  Old data removed');
    await Plant.insertMany(plantsData);
    console.log(`🌱 Successfully added ${plantsData.length} REAL plants with Parts Used!`);
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedDB();