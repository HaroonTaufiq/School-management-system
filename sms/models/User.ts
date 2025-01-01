import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['superadmin', 'admin', 'user'] },
  school: { type: String, required: function() { return this.role !== 'superadmin'; } },
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);

