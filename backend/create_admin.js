const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(' MongoDB Connected'))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

const createAdmin = async () => {
  try {
    const adminData = {
      name: "Super Admin",
      email: "admin@7250",    
      password: "123456", 
      role: "admin",
      isVerified: true     
    };

  
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log(" Admin Account already exists!");
      console.log("ID: " + adminData.email);
      console.log(" Pass: " + adminData.password);
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    const newAdmin = new User({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      role: adminData.role,
      isVerified: true,
      profilePhoto: ""
    });

    await newAdmin.save();
    console.log("Permanent Admin Created Successfully!");
    console.log(" Login ID: " + adminData.email);
    console.log(" Password: " + adminData.password);

    process.exit();
  } catch (error) {
    console.error(" Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();