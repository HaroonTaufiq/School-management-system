import mongoose from 'mongoose';

// Define the User interface
interface User {
  email: string;
  password: string;
  role: 'superadmin' | 'admin' | 'user';
  school?: string;
  name?: string;
}

// Update the user schema to use the User interface
const userSchema = new mongoose.Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['superadmin', 'admin', 'user'] },
  school: { type: String, required: function(this: { role: string }) { return this.role !== 'superadmin'; } },
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
