const express = require("express")
const router = express.Router()
const {
    ping
} = require("../app/controllers/PingController")

router.route("").get(ping);

module.exports = router