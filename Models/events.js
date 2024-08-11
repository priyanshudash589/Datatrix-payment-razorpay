const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, default: true },
  description: { type: String },
  price: { type: Number, default: true },
  totalSlots: { type: Number, default: true },
  availableSlots: { type: Number, default: true },
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
