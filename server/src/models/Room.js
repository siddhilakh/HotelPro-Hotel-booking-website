import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Standard', 'Deluxe', 'Suite', 'Presidential'], required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    size: { type: Number, default: 30 },
    bed: { type: String, default: 'King' },
    view: { type: String, default: 'City' },
    amenities: [String],
    images: [String],
    rating: { type: Number, default: 4.8, min: 0, max: 5 },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Room', roomSchema);
