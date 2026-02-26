const sequelize = require('../config/db');

async function addColumn() {
  try {
    await sequelize.getQueryInterface().addColumn('users', 'contact', {
      type: require('sequelize').DataTypes.STRING,
      allowNull: true,
    });
    console.log('users 表 contact 列添加成功');
  }
  catch (error) {
    console.log('列可能已存在或出错:', error.message);
  }
  finally {
    await sequelize.close();
  }
}

addColumn();
