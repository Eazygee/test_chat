const { validResponse, problemResponse } = require('../../../app/helpers/response');
const { SERVER_ERROR_CODE, NOTFOUND_ERROR_CODE } = require('../../../app/constants/ApiConstants');
const { authUser, generateBatchNo } = require('../../helpers/app_functions');
const model = require('../../../models');
const { Op } = require('sequelize');
const UserModel = require('../../../models/UserModel');
const { transporter } = require('../../../mail/mailer');

const List = async (req, res) => {
    try {
        const requestUser = req.user;
        const chats = await model.Chat.findAll({
            include: [{
                model: model.ChatUser,
                where: {
                    user_id: requestUser.user_id
                },
            }],
        });
        res.status(200).json(validResponse("Chats Retrieved successfully", chats));

    } catch (error) {
        console.error(error);
        res.status(500).json(problemResponse("Something went wrong"));
    }
}
const Initiate = async (req, res) => {
    const transaction = await model.sequelize.transaction();

    try {
        const body = req.body;
        const requestUser = req.user;
        const receipientUserId = body.reciever_id;
        if (receipientUserId == requestUser.user_id) {
            return res.status(500).json(problemResponse("You cannot chat with yourself"));
        }
        const chat = await model.Chat.findOne({
            include: [{
                model: model.ChatUser,
                where: {
                    [Op.or]: [
                        { user_id: requestUser.user_id },
                        { user_id: receipientUserId }
                    ]
                },
            }],
        }, { transaction })
        if (chat) {
            return res.status(500).json(problemResponse("Chat already initiated"));
        }
        const initiate = await model.Chat.create({
            user_id: requestUser.user_id,
            granted: false,
        }, { transaction })
        console.log("requestUser.user_id:", requestUser.user_id);
        console.log("initiate.id:", initiate.id);
        console.log("receipientUserId:", receipientUserId);

        const recepient = await model.ChatUser.create(
            {
                user_id: receipientUserId,
                chat_id: initiate.id,
            }, { transaction })
        await model.ChatUser.create({ user_id: requestUser.user_id, chat_id: initiate.id }, { transaction })

        const getRecipient = await model.ChatUser.findOne({
            where: { id: recepient.id },
            include: [{
                model: model.User,
            }],
        }, { transaction });

        let recipientName = null;
        let recipientEmail = null;

        if (getRecipient && getRecipient.User) {
            console.log("enter her");
            recipientName = getRecipient.User.name;
            recipientEmail = getRecipient.User.email;
        }
        console.log(recipientName);
        const responseData = {
            chat_id: initiate.id,
            is_granted: initiate.granted,
            reciepient: {
                name: recipientName,
                email: recipientEmail,
            }
        };

        await transaction.commit();
        res.status(200).json(validResponse("Chats Initiated successfully", responseData));

    } catch (error) {
        console.error(error);
        await transaction.rollback();
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json(problemResponse("Validation error", error.errors.map(e => e.message)));
        } else {
            // Send a generic error response
            res.status(500).json(problemResponse("Something went wrong"));
        }
    }
}
const SendMessage = async (req, res) => {
    try {
        const transaction = await model.sequelize.transaction();

        try {
            const body = req.body;
            const requestUser = req.user;
            const chatUsers = await model.ChatUser.findAll({
                where: {
                    user_id: requestUser.user_id,
                    chat_id: body.chat_id,
                    user_id: {
                        [Op.ne]: requestUser.user_id,
                    },
                },
            });
            chatUsers.forEach(async (chatUser) => {
                // Your code for each chatUser
                const chatId = chatUser.chat_id;
                // const recipent = await model.User.findByPk(chatUser.user_id);

                const initiator = await model.Chat.findOne({
                    where: { id: chatId },
                    include: [{
                        model: model.User,
                    }],
                }, { transaction })
                // console.log("initiator", getChat.User.id, "recipent", recipent.id, "loggedInuser", requestUser.user_id);
                if (initiator.granted === false && requestUser.user_id !== initiator.user_id) {
                    res.status(500).json(problemResponse("Recipient has not accepted message request"));
                }
            });
            const chat = await model.ChatMessage.create({
                user_id: requestUser.user_id,
                chat_id: body.chat_id,
                message: body.message,
                batch_no: generateBatchNo(),
            }, { transaction });

            // const senderInfo = await model.User.findOne({
            //     where: { id: requestUser.user_id }
            // })
            // const userEmails = chatUsers.map(chatUser => chatUser.User.email);
            // const userEmailsString = userEmails.join(', ');

            // const info = transporter.sendMail({
            //     from: senderInfo.name, // sender address
            //     to: userEmailsString,
            //     subject: "New Message..",
            //     html: `<p>${chat.message}</p>`, // html body
            // }, (error, info) => {
            //     if (error) {
            //         console.error(error);
            //     } else {
            //         console.log('Email sent: ' + info.response);
            //     }
            // });

            await transaction.commit();
            res.status(200).json(validResponse("Message sent successfully", chat));
        } catch (error) {
            await transaction.rollback();
            if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
                res.status(400).json(problemResponse("Validation error", error.errors.map(e => e.message)));
            } else {
                // Send a generic error response
                res.status(500).json(problemResponse("Something went wrong"));
            }
        }

    } catch (error) {

    }
}
const ListMessages = async (req, res) => {
    try {
        const params = req.params;
        const chat = await model.Chat.findOne({
            where: { id: params.chat_id },
            include: [
                {
                    model: model.ChatUser,
                    include: [
                        {
                            model: model.User,
                        },
                    ],
                },
                {
                    model: model.ChatMessage,
                },
            ],
            order: [[model.ChatMessage, 'createdAt', 'DESC']]
        });

        if (!chat) {
            return res.status(404).json(problemResponse("Chat not found"));
        }
        // const users = chat.ChatUsers.map(chatUser => chatUser.User);

        res.status(200).json(validResponse("Messages Retrieved successfully", { chat }));
    } catch (error) {
        res.status(500).json(problemResponse("Something went wrong"));
    }
}

const AcceptRequests = async (req, res) => {
    try {
        const { is_granted } = req.body;
        const { chat_id } = req.params;
        console.log("chat_id", chat_id, "is_granted", is_granted);
        const [updatedRows] = await model.Chat.update(
            { granted: is_granted },
            { where: { id: chat_id } }
        );
        res.status(200).json(validResponse("Chat request accepted successfully"));
    } catch (error) {
        res.status(500).json(problemResponse("Something went wrong"));
    }
}

module.exports = { List, ListMessages, SendMessage, Initiate, AcceptRequests }