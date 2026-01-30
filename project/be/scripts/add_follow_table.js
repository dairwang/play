const sequelize = require('../config/db');

async function createTable() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        await queryInterface.createTable('user_follows', {
            id: {
                type: require('sequelize').DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            follower_id: {
                type: require('sequelize').DataTypes.INTEGER,
                allowNull: false
            },
            following_id: {
                type: require('sequelize').DataTypes.INTEGER,
                allowNull: false
            },
            created_at: {
                type: require('sequelize').DataTypes.DATE,
                allowNull: false,
                defaultValue: require('sequelize').literal('CURRENT_TIMESTAMP')
            }
        });
        await queryInterface.addIndex('user_follows', ['follower_id', 'following_id'], { unique: true });
        console.log('user_follows 表创建成功');
    } catch (error) {
        console.log('表可能已存在或出错:', error.message);
    } finally {
        await sequelize.close();
    }
}

createTable();
