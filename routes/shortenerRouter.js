const express = require("express")
const route = express.Router()
const shortenerController = require("../controllers/shortenerController")
const isAuthenticated = require("../middleware/isAuthenticated")

route.get("/url-shortener",isAuthenticated,shortenerController.getUrlShortener)

module.exports = route