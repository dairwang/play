const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nickname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // 个性签名 / 个人简介
    signature: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // 联系方式（微信 / QQ / 手机等）
    contact: {
        type: DataTypes.STRING,
        allowNull: true
    },
    avatar: {
        type: DataTypes.STRING,
        defaultValue: 'https://images.unsplash.com/photo-1542206395-9feb3edaa68f?q=80&w=400&auto=format&fit=crop'
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'user'
    },
    is_companion: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false // We didn't define updated_at in SQL, let's disable it or add it if needed. 
                     // The SQL had created_at only. Let's stick to SQL.
});

module.exports = User;
