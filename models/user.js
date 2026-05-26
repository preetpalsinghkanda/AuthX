const mongoose = require("mongoose")
require("dotenv").config();

mongoose.connect(process.env.MONGO_URL);


const userSchema = mongoose.Schema({
    
    name: String,
    email: String,
    password: String,
    isAdmin: {
    type: Boolean
    }

})


module.exports = mongoose.model("user", userSchema);
