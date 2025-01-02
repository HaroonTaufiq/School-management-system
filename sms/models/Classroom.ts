import mongoose from 'mongoose';
import { z } from 'zod';

export const classroomValidationSchema = z.object({
    name: z.string().min(1, "Classroom name is required"),
    vacancy: z.number().min(0, "Vacancy must be a non-negative number"),
    school: z.string().min(1, "School ID is required")
});

const classroomSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    vacancy: { type: Number, required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
});

export const Classroom = mongoose.models.Classroom || mongoose.model('Classroom', classroomSchema);