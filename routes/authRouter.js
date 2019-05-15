const express = require("express")
const route = express.Router()
const authController = require("../controllers/authController")

route.get("/signup",authController.getSignup)
route.post("/signup",authController.postSignup)


module.exports =  route