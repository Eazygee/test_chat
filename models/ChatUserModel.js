
const { DataTypes } = require('sequelize');
const UserModel = require('./UserModel');


module.exports = (sequelize) => {
    const ChatUser = sequelize.define('ChatUser', {
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
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        }
    }, {
        tableName: 'chat_users', 
    });

    ChatUser.associate = (models) => {
        ChatUser.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
    };
    return ChatUser;
};
