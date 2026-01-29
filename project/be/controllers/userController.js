const User = require('../models/user');
const Order = require('../models/order');
const Game = require('../models/game');
const CompanionService = require('../models/companionService');
const { Op } = require('sequelize');

// 获取用户列表
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
            order: [['created_at', 'DESC']],
        });

        res.json({ code: 200, data: users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

// 更新用户信息（昵称 / 角色 / 是否陪玩 / 余额）
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nickname, role, is_companion, balance } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ code: 404, msg: '用户不存在' });
        }

        // 可选：限制角色取值范围
        const nextRole = role || user.role;
        if (!['user', 'admin'].includes(nextRole)) {
            return res.status(400).json({ code: 400, msg: '非法的角色类型' });
        }

        await user.update({
            nickname: nickname ?? user.nickname,
            role: nextRole,
            is_companion: typeof is_companion === 'boolean' ? is_companion : user.is_companion,
            balance: balance !== undefined ? balance : user.balance,
        });

        const safeUser = user.toJSON();
        delete safeUser.password;

        res.json({ code: 200, msg: '用户更新成功', data: safeUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

// 删除用户
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ code: 404, msg: '用户不存在' });
        }

        await user.destroy();
        res.json({ code: 200, msg: '用户删除成功' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

// 仪表盘统计
exports.getDashboardStats = async (req, res) => {
    try {
        const userCount = await User.count();
        const orderCount = await Order.count();
        const gameCount = await Game.count();
        const companionCount = await CompanionService.count();

        // 已完成订单总金额
        const revenue = (await Order.sum('amount', { where: { status: 'completed' } })) || 0;

        res.json({
            code: 200,
            data: {
                userCount,
                orderCount,
                gameCount,
                companionCount,
                revenue,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};
