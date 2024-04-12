const mongoose = require('mongoose');
const dotenv = require("dotenv").config();

// MongoDB's connection URI with authentication credentials

const MONGO_URI = `mongodb+srv://ghoshaniruddha2003:admin@cluster0.xa4ab9t.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0`;

// Async function to connect to the MongoDB database
const connectDatabase = async () => {
    // Using Mongoose to connect to the specified MongoDB URI
    await mongoose.connect(MONGO_URI, {}).then(() => {
        // Log a message when the connection is successful
        console.log('DB Connected');
    }).catch((err) => {
        // Log an error message if the connection fails
        console.log(err);
    });
}

// Exporting the connectDatabase function for use in other parts of the application
module.exports = connectDatabase;