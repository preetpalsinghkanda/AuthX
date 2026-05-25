const mongooose = require("mongoose")

mongooose.connect("mongodb:127.0.0.1:27017/AuthX");


const userSchema = mongooose.Schema({
    username : String,
    name : String,
    age : Number,
    email : String,
    password : String

})


module.exports = mongooose.model("user" , userSchema);
