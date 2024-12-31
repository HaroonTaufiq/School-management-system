import mongoose from 'mongoose';

const classroomSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    vacancy: { type: Number, required: true },
    school: { type: String, required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
});

export const Classroom = mongoose.models.Classroom || mongoose.model('Classroom', classroomSchema);

