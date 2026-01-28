const sequelize = require('../config/db');

async function addColumn() {
    try {
        await sequelize.getQueryInterface().addColumn('orders', 'remark', {
            type: require('sequelize').DataTypes.TEXT,
            allowNull: true
        });
        console.log('Column added successfully');
    } catch (error) {
        console.log('Column might already exist or error:', error.message);
    } finally {
        await sequelize.close();
    }
}

addColumn();
