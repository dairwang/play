const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');

const Follow = sequelize.define('Follow', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    follower_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: User, key: 'id' }
    },
    following_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: User, key: 'id' }
    }
}, {
    tableName: 'user_follows',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        { unique: true, fields: ['follower_id', 'following_id'] }
    ]
});

Follow.belongsTo(User, { as: 'Follower', foreignKey: 'follower_id' });
Follow.belongsTo(User, { as: 'Following', foreignKey: 'following_id' });

module.exports = Follow;
