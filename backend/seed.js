import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Donation from './models/Donation.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for structured seeding...");

    // 1. Clear existing data
    await User.deleteMany({});
    await Donation.deleteMany({});

    // 2. CREATE 3 NGOs (Receivers)
    const ngos = await User.insertMany([
      { fullName: "Sarah Chen", organizationName: "Urban Harvest Food Bank", email: "sarah@urbanharvest.org", password: "hashed_password", role: "receiver" },
      { fullName: "Mark Rodriguez", organizationName: "Unity Shelters", email: "mark@unity.org", password: "hashed_password", role: "receiver" },
      { fullName: "Amina Jalloh", organizationName: "Grace Community Kitchen", email: "amina@grace.org", password: "hashed_password", role: "receiver" }
    ]);

    // 3. CREATE 6 DONORS (Donators)
    const donors = await User.insertMany([
      { fullName: "Chef Luca", organizationName: "Bella Italia Bistro", email: "luca@bella.com", password: "hashed_password", role: "donator" },
      { fullName: "David Miller", organizationName: "Sunset Organic Farm", email: "david@sunsetfarm.com", password: "hashed_password", role: "donator" },
      { fullName: "Emma Watson", organizationName: "The Daily Crust Bakery", email: "emma@dailycrust.com", password: "hashed_password", role: "donator" },
      { fullName: "Robert King", organizationName: "Green Grocery Co.", email: "robert@greengrocery.com", password: "hashed_password", role: "donator" },
      { fullName: "Sophie Lin", organizationName: "Mountain Springs Catering", email: "sophie@mtncatering.com", password: "hashed_password", role: "donator" },
      { fullName: "Chris Evans", organizationName: "Harbor Seafood Market", email: "chris@harborsea.com", password: "hashed_password", role: "donator" }
    ]);

    // 4. CREATE DIVERSE DONATIONS (All with expires_at added)
    const donationEntries = [
      {
        donator_id: donors[0]._id,
        title: "Large Batch of Penne Arrabbiata",
        description: "Freshly cooked pasta, slightly spicy tomato sauce.",
        food_type: "Cooked Meals",
        quantity: "40 portions",
        pickup_address: "442 Little Italy Way",
        city: "New York",
        status: "claimed",
        claimed_by: ngos[0]._id,
        createdAt: new Date(),
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 hours from now
      },
      {
        donator_id: donors[1]._id,
        title: "Assorted Seasonal Vegetables",
        description: "Carrots, kale, and bell peppers.",
        food_type: "Fresh Produce",
        quantity: "15 kg",
        pickup_address: "99 Farm Road",
        city: "New York",
        status: "available",
        createdAt: new Date(),
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 48) // 48 hours from now
      },
      {
        donator_id: donors[2]._id,
        title: "Morning Pastry Surplus",
        description: "Croissants and sourdough loaves.",
        food_type: "Bakery Items",
        quantity: "25 items",
        pickup_address: "12 Baker St",
        city: "New York",
        status: "completed",
        claimed_by: ngos[1]._id,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // Created 2 days ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 44), // Completed 4 hours later
        expires_at: new Date() // Expired now
      },
      {
        donator_id: donors[3]._id,
        title: "Milk and Greek Yogurt Packets",
        description: "Cold storage maintained.",
        food_type: "Dairy Products",
        quantity: "12 liters",
        pickup_address: "500 Market Square",
        city: "New York",
        status: "available",
        createdAt: new Date(),
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 12) // 12 hours from now
      },
      {
        donator_id: donors[4]._id,
        title: "High-Protein Quinoa Salad",
        description: "Gluten-free, vegan.",
        food_type: "Cooked Meals",
        quantity: "20 bowls",
        pickup_address: "Catering Bay 4",
        city: "New York",
        status: "available",
        createdAt: new Date(),
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 36) // 36 hours from now
      }
    ];

    await Donation.insertMany(donationEntries);

    console.log(`--- SEED COMPLETE ---`);
    console.log(`NGOs: 3 | Donors: 6 | Donations: ${donationEntries.length}`);
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seedData();