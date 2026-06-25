const mongoose = require('mongoose');

const categoryOfferSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, unique: true, trim: true },
    buyQty: { type: Number, required: true, min: 1 },
    freeQty: { type: Number, required: true, min: 1, default: 1 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.CategoryOffer || mongoose.model('CategoryOffer', categoryOfferSchema);
