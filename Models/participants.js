const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  college: { type: String, required: true },
  eventTitle: { type: String, required: true }, 
  paymentStatus: { type: String, default: "pending" }, 
  paymentAmount: { type: Number, required: true }
});

const Participant = mongoose.model("Participant", participantSchema);

module.exports = Participant;
