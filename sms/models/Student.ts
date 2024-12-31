import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    classroom: { type: String }
});

export const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

