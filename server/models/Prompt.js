const mongoose = require('mongoose');

// Define the schema for the model
const PromptSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true, // This makes the 'prompt' field mandatory
  }
});

// Create and export the model
const Prompt = mongoose.model('Prompt', PromptSchema);

module.exports = Prompt;