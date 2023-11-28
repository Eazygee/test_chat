"use strict";
const nodemailer = require("nodemailer");
require('dotenv').config();

const env = process.env;
const transporter = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    secure: false,
    auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASS,
    },
});
module.exports = { transporter }

