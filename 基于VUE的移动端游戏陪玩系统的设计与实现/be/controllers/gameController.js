const Game = require('../models/game');
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

        await game.destroy();
        res.json({ code: 200, msg: '游戏删除成功' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};
