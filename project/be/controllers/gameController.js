const Game = require('../models/game');
const Order = require('../models/order');
const CompanionService = require('../models/companionService');
const { Op } = require('sequelize');

// Get game list (with search)
exports.getGames = async (req, res) => {
    try {
        const { keyword } = req.query;
        const where = {};
        if (keyword) {
            where.name = { [Op.like]: `%${keyword}%` };
        }

        const games = await Game.findAll({
            where,
            order: [['created_at', 'DESC']]
        });
        
        res.json({ code: 200, data: games });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

// Create game
exports.createGame = async (req, res) => {
    try {
        const { name, icon, cover } = req.body;
        if (!name) {
            return res.status(400).json({ code: 400, msg: '游戏名称为必填项' });
        }

        const game = await Game.create({ name, icon, cover });
        res.status(201).json({ code: 200, msg: '游戏创建成功', data: game });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

// Update game
exports.updateGame = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, icon, cover } = req.body;

        const game = await Game.findByPk(id);
        if (!game) {
            return res.status(404).json({ code: 404, msg: '游戏不存在' });
        }

        await game.update({ name, icon, cover });
        res.json({ code: 200, msg: '游戏更新成功', data: game });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

// Delete game
exports.deleteGame = async (req, res) => {
    try {
        const { id } = req.params;
        const game = await Game.findByPk(id);
        
        if (!game) {
            return res.status(404).json({ code: 404, msg: '游戏不存在' });
        }

        // 检查是否有关联的订单（orders 表的外键没有 CASCADE）
        // 检查订单
        const orderCount = await Order.count({ where: { game_id: id } });
        if (orderCount > 0) {
            return res.status(400).json({ 
                code: 400, 
                msg: `无法删除：该游戏还有 ${orderCount} 个关联订单，请先处理相关订单` 
            });
        }

        // 检查陪玩服务（虽然有 CASCADE，但先检查可以给用户更好的提示）
        const serviceCount = await CompanionService.count({ where: { game_id: id } });
        if (serviceCount > 0) {
            // 如果有服务，会级联删除，但可以给用户提示
            console.log(`删除游戏 ${game.name}，将同时删除 ${serviceCount} 个关联的陪玩服务`);
        }

        await game.destroy();
        res.json({ code: 200, msg: '游戏删除成功' });
    } catch (error) {
        console.error('删除游戏错误:', error);
        
        // 处理 Sequelize 外键约束错误
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ 
                code: 400, 
                msg: '无法删除：该游戏还有关联数据，请先处理相关订单或服务' 
            });
        }
        
        res.status(500).json({ code: 500, msg: '服务器错误', error: error.message });
    }
};
