const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');
const Game = require('./game');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    order_no: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    companion_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    game_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Game,
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '订单总金额'
    },
    duration_hours: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 1,
        comment: '陪玩时长（小时）'
    },
    remark: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '订单备注'
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
        comment: 'pending, accepted, completed, cancelled'
    },
    completed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // 订单评价：1-5 星
    rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '1-5 星评分'
    },
    // 评价文字
    review: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '评价内容'
    },
    // 评价时间
    evaluated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '评价时间'
    }
}, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// Associations
User.hasMany(Order, { foreignKey: 'user_id', as: 'ClientOrders' });
User.hasMany(Order, { foreignKey: 'companion_id', as: 'CompanionOrders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'Client' });
Order.belongsTo(User, { foreignKey: 'companion_id', as: 'Companion' });

Game.hasMany(Order, { foreignKey: 'game_id' });
Order.belongsTo(Game, { foreignKey: 'game_id' });

module.exports = Order;
