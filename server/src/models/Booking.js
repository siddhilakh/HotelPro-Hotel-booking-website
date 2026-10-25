import mongoose from 'mongoose';
import crypto from 'crypto';

const bookingSchema = new mongoose.Schema(
  {
    reference: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, required: true, min: 1 },
    nights: { type: Number, required: true },
    total: { type: Number, required: true },
    specialRequests: { type: String, maxlength: 500 },
    status: {
      type: String,
      enum: ['confirmed', 'checked-in', 'checked-out', 'cancelled'],
      default: 'confirmed',
    },
    payment: {
      method: { type: String, enum: ['card', 'upi', 'pay-at-hotel'], default: 'card' },
      status: { type: String, enum: ['paid', 'pending', 'refunded'], default: 'paid' },
    },
  },
  { timestamps: true }
);

bookingSchema.index({ room: 1, checkIn: 1, checkOut: 1 });

bookingSchema.pre('validate', function (next) {
  if (!this.reference) {
    this.reference = 'HP-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  }
  next();
});

export default mongoose.model('Booking', bookingSchema);
