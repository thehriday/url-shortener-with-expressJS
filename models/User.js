const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name:String,
    userName:String,
    email:String,
    password:String
})

module.exports = mongoose.model("User",userSchema)