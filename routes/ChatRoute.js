const express = require("express")
const router = express.Router()
const {
    List, SendMessage, Initiate, ListMessages, AcceptRequests
} = require("../app/controllers/Chat/ChatController");

router.route("/list").get(List);
router.route("/list-messages/:chat_id").get(ListMessages);
router.route("/accept-requests/:chat_id").patch(AcceptRequests);
router.route("/send-message").post(SendMessage);
router.route("/initiate").post(Initiate);

module.exports = router