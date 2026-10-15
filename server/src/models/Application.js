const mongoose = require('mongoose');

const STATUSES = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'];

const applicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    company: { type: String, required: [true, 'Company is required'], trim: true, maxlength: 100 },
    role: { type: String, required: [true, 'Role is required'], trim: true, maxlength: 100 },
    status: { type: String, enum: STATUSES, default: 'Wishlist' },
    appliedDate: { type: Date },
    link: { type: String, trim: true, maxlength: 500 },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);
module.exports.STATUSES = STATUSES;