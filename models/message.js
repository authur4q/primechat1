const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  room: {
    type: String,
    required: true,
    index: true,
  },
  socketId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Message || mongoose.model('Message', MessageSchema);