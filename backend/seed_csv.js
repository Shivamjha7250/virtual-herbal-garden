const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const csv = require('csv-parser');
const Plant = require('./models/Plant');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => { console.error(err); process.exit(1); });

const results = [];

fs.createReadStream('plants.csv')
  .pipe(csv())
  .on('data', (data) => {
    
    // 1. Category Standardize karna
    let category = data.category ? data.category.trim() : "General health";
    if (category === 'General Health') category = 'General health'; // Case match fix

    // 2. Images Clean karna
    const images = [
      data.image1, data.image2, data.image3, data.image4, data.image5
    ].filter(img => img && img.trim() !== ""); 

    results.push({
      name: data.plant_name,
      botanicalName: `${data.plant_name} (Scientific)`,
      description: data.introduction,
      category: category,
      region: "India",
      
      // ✅ FIX: Category ko bhi 'uses' mein daal diya taaki Filter kaam kare
      uses: [category, data.how_to_use], 
      
      advantages: [data.advantages],
      disadvantages: [data.disadvantages],
      sideEffects: data.side_effects,
      images: images,
      
      selected3DImageIndex: 0,
      isApproved: true
    });
  })
  .on('end', async () => {
    try {
      await Plant.deleteMany({});
      console.log('🗑️  Old data removed');

      if (results.length > 0) {
        await Plant.insertMany(results);
        console.log(`🎉 Successfully added ${results.length} plants!`);
      } else {
        console.log('⚠️ No data found in CSV.');
      }
      process.exit();
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  });