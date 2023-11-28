
const { DataTypes } = require('sequelize');
const UserModel = require('./UserModel');
const ChatModel = require('./ChatModel');


module.exports = (sequelize) => {
    const ChatMessage = sequelize.define('ChatMessage', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        chat_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "chats",
                key: 'id',
            },
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: 'id',
            },
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        batch_no: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        granted: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        read_at: {
            allowNull: true,
            type: DataTypes.DATE,
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        }
    }, {
        tableName: 'chat_messages',
    });
    ChatMessage.associate = (models) => {
        ChatMessage.belongsTo(models.Chat, { foreignKey: 'chat_id', onDelete: 'CASCADE' });
        ChatMessage.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
    };

    return ChatMessage;
};
