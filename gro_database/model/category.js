const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,  // URL or Base64 string
        required: true
    }
});

module.exports = mongoose.model("Category", categorySchema);
