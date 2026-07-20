import 'dotenv/config';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import mongoose from 'mongoose';

const DEFAULT_CATEGORIES = [
  'Plumbing', 'Leakage', 'Roof Leakage', 'Toilet Repair', 'Sewer Blockage',
  'Water Supply', 'Door Repair', 'Window Repair', 'Painting', 'Flooring',
  'Masonry', 'Crack in Wall', 'Ceiling Damage', 'Road Repair', 'Drain Repair',
  'Retaining Wall', 'Street Furniture', 'Others',
];

async function seed() {
  await connectDB();

  const adminExists = await User.findOne({ username: 'admin' });
  if (!adminExists) {
    await User.create({
      name: 'System Administrator',
      username: 'admin',
      password: 'ChangeMe@123', // CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN
      role: 'admin',
    });
    console.log('Created default admin user -> username: admin / password: ChangeMe@123');
  } else {
    console.log('Admin user already exists, skipping.');
  }

  const operatorExists = await User.findOne({ username: 'operator' });
  if (!operatorExists) {
    await User.create({
      name: 'Operator User',
      username: 'operator',
      password: 'ChangeMe@123',
      role: 'operator',
    });
    console.log('Created default operator user -> username: operator / password: ChangeMe@123');
  } else {
    console.log('Operator user already exists, skipping.');
  }

  const citizenExists = await User.findOne({ username: 'citizen' });
  if (!citizenExists) {
    await User.create({
      name: 'Citizen User',
      username: 'citizen',
      password: 'ChangeMe@123',
      role: 'citizen',
    });
    console.log('Created default citizen user -> username: citizen / password: ChangeMe@123');
  } else {
    console.log('Citizen user already exists, skipping.');
  }

  for (const name of DEFAULT_CATEGORIES) {
    await Category.updateOne({ name }, { name }, { upsert: true });
  }
  console.log(`Seeded ${DEFAULT_CATEGORIES.length} default categories.`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
