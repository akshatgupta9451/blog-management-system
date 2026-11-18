// Promotes an existing account to admin: npm run make-admin -- user@example.com
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/user.model.js';
import { USER_ROLES } from '../src/constants/index.js';

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error('Usage: npm run make-admin -- <email>');
  process.exit(1);
}

await connectDB();

const user = await User.findOneAndUpdate(
  { email },
  { role: USER_ROLES.ADMIN },
  { returnDocument: 'after' }
);

console.log(user ? `${user.email} is now an admin` : `No user found with email ${email}`);
await mongoose.connection.close();
process.exit(user ? 0 : 1);
