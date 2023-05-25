const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
const prodcategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
}, { timeseries: true });

// Export the model
module.exports = mongoose.model('PCategory', prodcategorySchema);
