import mongoose from 'mongoose';
import { z } from 'zod';

export const studentValidationSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    classroom: z.string().min(1, "Classroom ID is required"),
  });

const studentSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true } 
});

export const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);