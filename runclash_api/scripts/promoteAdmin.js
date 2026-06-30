const mongoose = require('mongoose');
// Use env or fallback to the same default as the app
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/class-36a-db';

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

async function promote(email) {
  await mongoose.connect(MONGODB_URL);
  const res = await User.updateOne({ email }, { $set: { role: 'admin' } });
  console.log('Update result:', res);
  const user = await User.findOne({ email }).lean();
  if (!user) {
    console.error('User not found after update:', email);
    process.exit(1);
  }
  console.log('User after update:', { email: user.email, role: user.role, _id: user._id });
  process.exit(0);
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: node promoteAdmin.js <email>');
  process.exit(1);
}
promote(email).catch(err => { console.error(err); process.exit(1); });
