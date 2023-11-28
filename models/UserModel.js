
const { DataTypes } = require('sequelize');


module.exports = (sequelize, models) => {
    const User = sequelize.define('User', {
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
    }, {
        tableName: 'users', 
    });
    return User;
};
