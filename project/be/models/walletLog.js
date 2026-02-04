const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');

const WalletLog = sequelize.define('WalletLog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'deposit, payment, income, withdraw'
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    related_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'order_id etc'
    }
}, {
    tableName: 'wallet_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// Associations
User.hasMany(WalletLog, { foreignKey: 'user_id' });
WalletLog.belongsTo(User, { foreignKey: 'user_id' });

module.exports = WalletLog;

