const mongoose = require('mongoose');

const InputSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  birthdate: {
    type: String,
  },
  flow: {
    type: String,
    enum: ['name', 'birthdate', 'done'],
    // default: 'user',
  },
  date: {
    type: Date,
    default: new Date()
  }
});

module.exports = mongoose.model('Input', InputSchema);
