
const { DataTypes } = require('sequelize');
const UserModel = require('./UserModel');


module.exports = (sequelize, models) => {
    const Chat = sequelize.define('Chat', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: 'id',
            },
        },
        granted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
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
        tableName: 'chats',
    });

    Chat.associate = (models) => {
        Chat.hasMany(models.ChatUser, { foreignKey: 'chat_id', onDelete: 'CASCADE' });
        Chat.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
        Chat.hasMany(models.ChatMessage, { foreignKey: 'chat_id', onDelete: 'CASCADE' });

    };
    return Chat;
};
