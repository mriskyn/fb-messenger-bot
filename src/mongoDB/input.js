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
    enum: ['name', 'birthdate', 'done', 'intro'],
    default: 'name',
  },
  date: {
    type: Date,
    default: new Date()
  },
  facebook_id: {
    type: String
  }
});

module.exports = mongoose.model('Input', InputSchema);
