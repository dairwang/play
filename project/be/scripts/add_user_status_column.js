const sequelize = require('../config/db');

async function addColumn() {
  try {
    await sequelize.getQueryInterface().addColumn('users', 'status', {
      type: require('sequelize').DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
    console.log('users 表 status 列添加成功');
  }
  catch (error) {
    console.log('列可能已存在或出错:', error.message);
  }
  finally {
    await sequelize.close();
  }
}

addColumn();
