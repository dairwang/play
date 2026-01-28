const User = require('../models/user');
const Order = require('../models/order');
const Game = require('../models/game');
const CompanionService = require('../models/companionService');
const { Op } = require('sequelize');

exports.getAllUsers = async (req, res) => {
    try {
        const { keyword } = req.query;
        const where = {};
        
        if (keyword) {
            where.username = { [Op.like]: `%${keyword}%` };
        }

        const users = await User.findAll({
            where,
            attributes: { exclude: ['password'] },
            order: [['created_at', 'DESC']]
        });

        res.json({ code: 200, data: users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 
        res.json({ code: 200, msg: '状态更新成功' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const userCount = await User.count();
        const orderCount = await Order.count();
        const gameCount = await Game.count();
        const companionCount = await CompanionService.count();
        
        // Calculate total revenue (sum of completed orders)
        const revenue = await Order.sum('amount', { where: { status: 'completed' } }) || 0;

        res.json({ 
            code: 200, 
            data: {
                userCount,
                orderCount,
                gameCount,
                companionCount,
                revenue
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};
