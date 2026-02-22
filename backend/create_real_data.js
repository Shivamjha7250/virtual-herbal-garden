const fs = require('fs');
const path = require('path');

const realPlants = [

  { name: "Tulsi", bot: "Ocimum tenuiflorum", cat: "Immunity", desc: "The Queen of Herbs, widely used for medicinal purposes.", use: "Chew leaves, Tea", adv: "Boosts Immunity, Anti-bacterial", dis: "Blood thinning", side: "Avoid before surgery" },
  { name: "Giloy", bot: "Tinospora cordifolia", cat: "Immunity", desc: "Known as 'Amrita', root of immortality.", use: "Juice, Powder", adv: "Chronic Fever, Dengue recovery", dis: "Constipation risk", side: "Lowers blood sugar" },
  { name: "Ashwagandha", bot: "Withania somnifera", cat: "Immunity", desc: "Powerful adaptogen for stress and energy.", use: "Powder with milk", adv: "Reduces Stress, Strength", dis: "Heat inducing", side: "Drowsiness" },
  { name: "Mulethi", bot: "Glycyrrhiza glabra", cat: "Immunity", desc: "Liquorice root, sweet and soothing.", use: "Chew stick, Powder", adv: "Sore throat, Acidity", dis: "Water retention", side: "High BP risk" },
  { name: "Turmeric", bot: "Curcuma longa", cat: "Immunity", desc: "Golden spice with curcumin.", use: "Milk, Cooking", adv: "Anti-inflammatory, Antiseptic", dis: "Stains teeth", side: "Stomach upset in excess" },
  
  { name: "Neem", bot: "Azadirachta indica", cat: "Skin Care", desc: "Ultimate antibacterial herb.", use: "Paste, Oil", adv: "Acne cure, Blood purifier", dis: "Very bitter", side: "Not for infants" },
  { name: "Aloe Vera", bot: "Aloe barbadensis", cat: "Skin Care", desc: "Succulent plant with healing gel.", use: "Apply gel, Juice", adv: "Hydration, Sunburn relief", dis: "Sticky feel", side: "Diarrhea if eaten raw" },
  { name: "Sandalwood", bot: "Santalum album", cat: "Skin Care", desc: "Cooling and aromatic wood.", use: "Paste", adv: "Glowing skin, Cooling", dis: "Expensive", side: "Rare allergies" },
  { name: "Manjistha", bot: "Rubia cordifolia", cat: "Skin Care", desc: "Blood purifying creeper.", use: "Powder, Decoction", adv: "Skin whitening, Detox", dis: "Changes urine color", side: "Safe in moderation" },
  { name: "Rose", bot: "Rosa damascena", cat: "Skin Care", desc: "Used for toner and cooling.", use: "Rose water", adv: "Toner, Soothing", dis: "None", side: "None" },

  { name: "Triphala", bot: "Polyherbal", cat: "Digestion", desc: "Mix of Amla, Haritaki, Bibhitaki.", use: "Powder with water", adv: "Best laxative, Detox", dis: "Loose motions", side: "Dehydration" },
  { name: "Isabgol", bot: "Plantago ovata", cat: "Digestion", desc: "Psyllium husk fiber.", use: "With warm water", adv: "Constipation relief", dis: "Bloating", side: "Choking if dry" },
  { name: "Ajwain", bot: "Trachyspermum ammi", cat: "Digestion", desc: "Carom seeds for gas relief.", use: "Chew, Water", adv: "Instant gas relief", dis: "Heat body", side: "Acidity" },
  { name: "Jeera", bot: "Cuminum cyminum", cat: "Digestion", desc: "Cumin seeds.", use: "Water, Food", adv: "Metabolism, Digestion", dis: "None", side: "None" },
  { name: "Ginger", bot: "Zingiber officinale", cat: "Digestion", desc: "Root for gut health.", use: "Tea, Chew", adv: "Nausea, Digestion", dis: "Heartburn", side: "Mouth irritation" },

  { name: "Vasaka", bot: "Adhatoda vasica", cat: "Respiratory", desc: "Potent herb for asthma.", use: "Juice, Decoction", adv: "Clears lungs, Asthma", dis: "Vomiting in high dose", side: "Nausea" },
  { name: "Tulsi", bot: "Ocimum sanctum", cat: "Respiratory", desc: "Holy Basil.", use: "Tea", adv: "Cough, Cold", dis: "Blood thinning", side: "Acidic" },
  { name: "Kantakari", bot: "Solanum xanthocarpum", cat: "Respiratory", desc: "Prickly herb for cough.", use: "Decoction", adv: "Expectorant, Throat pain", dis: "Toxic in excess", side: "Dry mouth" },
  { name: "Pippali", bot: "Piper longum", cat: "Respiratory", desc: "Long pepper.", use: "Powder with honey", adv: "Lungs, Metabolism", dis: "Spicy", side: "Acidity" },
  { name: "Kalmegh", bot: "Andrographis paniculata", cat: "Respiratory", desc: "King of bitters.", use: "Juice", adv: "Fever, Infection", dis: "Very bitter", side: "Vomiting" },

  { name: "Arjuna", bot: "Terminalia arjuna", cat: "Heart Health", desc: "Bark tonic for heart.", use: "Milk decoction", adv: "Strengthens heart, BP", dis: "Mild gastric issue", side: "Rare nausea" },
  { name: "Garlic", bot: "Allium sativum", cat: "Heart Health", desc: "Clove for cholesterol.", use: "Raw, Cooked", adv: "Thins blood, Cholesterol", dis: "Bad breath", side: "Heartburn" },
  { name: "Cinnamon", bot: "Cinnamomum verum", cat: "Heart Health", desc: "Spice for circulation.", use: "Powder", adv: "Blood flow, Sugar", dis: "Heat", side: "Mouth sores" },
  { name: "Flaxseed", bot: "Linum usitatissimum", cat: "Heart Health", desc: "Omega-3 seeds.", use: "Roasted", adv: "Good fats, Heart", dis: "Hard to digest", side: "Bloating" },
  { name: "Hibiscus", bot: "Hibiscus rosa-sinensis", cat: "Heart Health", desc: "Flower tea.", use: "Tea", adv: "Lowers BP", dis: "Cold potency", side: "Dizziness" },

  { name: "Amla", bot: "Phyllanthus emblica", cat: "General health", desc: "Vitamin C powerhouse.", use: "Raw, Juice", adv: "Eyes, Hair, Skin", dis: "Sour throat", side: "Acidity" },
  { name: "Brahmi", bot: "Bacopa monnieri", cat: "General health", desc: "Brain tonic.", use: "Ghee, Powder", adv: "Memory, Focus", dis: "Slow heart rate", side: "Stomach cramps" },
  { name: "Shankhpushpi", bot: "Convolvulus pluricaulis", cat: "General health", desc: "Mental peace herb.", use: "Syrup", adv: "Calmness, Sleep", dis: "Low BP", side: "Drowsiness" },
  { name: "Moringa", bot: "Moringa oleifera", cat: "General health", desc: "Drumstick leaves.", use: "Powder, Cooked", adv: "Nutrition, Bones", dis: "Laxative", side: "Nausea" },
  { name: "Gokshura", bot: "Tribulus terrestris", cat: "General health", desc: "Kidney and vitality.", use: "Powder", adv: "Kidney stones, Energy", dis: "Dehydration", side: "Insomnia" }
];

const header = "category,plant_name,introduction,how_to_use,advantages,disadvantages,side_effects,image1,image2,image3,image4,image5\n";
let csvContent = header;

for (let i = 0; i < 300; i++) {
  const plant = realPlants[i % realPlants.length];
  
  const color = i % 2 === 0 ? "22c55e" : "166534";
  const imgUrl = `https://placehold.co/600x400/${color}/ffffff?text=${plant.name.replace(" ", "+")}`;
  
  const row = [
    plant.cat,
    `${plant.name}`,
    `"${plant.desc}"`, 
    `"${plant.use}"`,
    `"${plant.adv}"`,
    `"${plant.dis}"`,
    `"${plant.side}"`,
    imgUrl, imgUrl, imgUrl, imgUrl, imgUrl 
  ].join(",");

  csvContent += row + "\n";
}

const filePath = path.join(__dirname, 'plants.csv');
fs.writeFileSync(filePath, csvContent);

console.log(` 'plants.csv' generated with 300 real data entries at: ${filePath}`);