const mongoose = require('mongoose');
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/class-36a-db';

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

async function getUser(email) {
  await mongoose.connect(MONGODB_URL);
  const user = await User.findOne({ email }).lean();
  console.log(user);
  process.exit(0);
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: node getUser.js <email>');
  process.exit(1);
}
getUser(email).catch(err => { console.error(err); process.exit(1); });
