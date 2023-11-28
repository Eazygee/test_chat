const express = require("express")
const app = express();
const pingRoute = require("./routes/PingRoute")
const authRoute = require("./routes/AuthRoute")
const chatRoute = require("./routes/ChatRoute")
const { sequelize, models } = require('./models/index');
require("dotenv").config()
app.use(express.json())

const authenticateToken = require("./app/middleware/AuthMiddleware");


// sequelize.sync()
sequelize.authenticate()
    .then(() => {
        console.log('Connected to the database.');
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error);
    });
app.use("/ping", authenticateToken, pingRoute)
app.use('/api/auth', authRoute)
app.use('/api/chats', authenticateToken, chatRoute)

const port = 5500
const start = async () => {
    try {
        app.listen(port, console.log(`connecting to port ${port}`))
    } catch (error) {

    }
}
start(); 
