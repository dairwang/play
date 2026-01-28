const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');
const Order = require('./order');

const RefundRequest = sequelize.define('RefundRequest', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Order,
            key: 'id'
        }
    },
    applicant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
        comment: 'pending, approved, rejected'
    },
    processed_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'refund_requests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// Associations
RefundRequest.belongsTo(Order, { foreignKey: 'order_id', as: 'Order' });
RefundRequest.belongsTo(User, { foreignKey: 'applicant_id', as: 'Applicant' });
Order.hasMany(RefundRequest, { foreignKey: 'order_id', as: 'Refunds' });

module.exports = RefundRequest;

