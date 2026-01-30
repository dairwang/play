const sequelize = require('../config/db');

async function addColumns() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        const DataTypes = require('sequelize').DataTypes;

        await queryInterface.addColumn('orders', 'rating', {
            type: DataTypes.INTEGER,
            allowNull: true,
        });
        await queryInterface.addColumn('orders', 'review', {
            type: DataTypes.TEXT,
            allowNull: true,
        });
        await queryInterface.addColumn('orders', 'evaluated_at', {
            type: DataTypes.DATE,
            allowNull: true,
        });
        console.log('orders 表评价相关列添加成功');
    } catch (error) {
        console.log('列可能已存在或出错:', error.message);
    } finally {
        await sequelize.close();
    }
}

addColumns();
