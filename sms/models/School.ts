import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    classrooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

export const School = mongoose.models.School || mongoose.model('School', schoolSchema);

