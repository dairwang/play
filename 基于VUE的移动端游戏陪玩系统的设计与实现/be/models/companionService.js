const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');
const Game = require('./game');

const CompanionService = sequelize.define('CompanionService', {
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
    game_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Game,
            key: 'id'
        }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '价格'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '服务描述'
    },
    audit_status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
        comment: 'pending, approved, rejected'
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: '1在线 0离线'
    }
}, {
    tableName: 'companion_services',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// Associations
User.hasMany(CompanionService, { foreignKey: 'user_id' });
CompanionService.belongsTo(User, { foreignKey: 'user_id' });

Game.hasMany(CompanionService, { foreignKey: 'game_id' });
CompanionService.belongsTo(Game, { foreignKey: 'game_id' });

module.exports = CompanionService;
