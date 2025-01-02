import mongoose from 'mongoose';
import { z } from 'zod';

export const schoolValidationSchema = z.object({
    name: z.string().min(1, "School name is required"),
    location: z.string().min(1, "Location is required"),
});

export const schoolSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    classrooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

export const School = mongoose.models.School || mongoose.model('School', schoolSchema);

