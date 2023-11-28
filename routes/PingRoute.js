const express = require("express")
const router = express.Router()
const {
    ping
} = require("../app/controllers/PingController")

router.get('/ping');
module.exports = router