import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  meetingId: { type: String, required: true },
  nickname: { type: String, required: true },
  password: { type: String, required: true },
  availableSlots: { type: [String], default: [] },
});

participantSchema.index({ meetingId: 1, nickname: 1 }, { unique: true });

export default mongoose.model('Participant', participantSchema);
