const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Game = sequelize.define('Game', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '游戏名称'
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '图标'
    },
    cover: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '封面'
    }
}, {
    tableName: 'games',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Game;
