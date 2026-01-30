const Order = require('../models/order');
const User = require('../models/user');
const Game = require('../models/game');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

// Create Order (User)
exports.createOrder = async (req, res) => {
    try {
        const { companion_id, game_id, amount, duration_hours, remark } = req.body;
        const user_id = req.user.id;

        // Simple validation: cannot order self
        if (user_id === companion_id) {
            return res.status(400).json({ code: 400, msg: '不能向自己下单' });
        }

        const hours = Number(duration_hours);
        if (!hours || hours <= 0) {
            return res.status(400).json({ code: 400, msg: '陪玩时长必须大于 0 小时' });
        }

        const finalAmount = Number(amount);
        if (!finalAmount || finalAmount <= 0) {
            return res.status(400).json({ code: 400, msg: '订单金额不合法' });
        }

        const order = await Order.create({
            order_no: uuidv4().replace(/-/g, ''),
            user_id,
            companion_id,
            game_id,
            amount: finalAmount,
            duration_hours: hours,
            remark,
            status: 'pending'
        });

        res.status(201).json({ code: 200, msg: '订单创建成功', data: order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

// Get My Orders (User/Companion)
exports.getMyOrders = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { role } = req.query; // 'client' or 'companion'

        const where = role === 'companion' ? { companion_id: user_id } : { user_id };

        const orders = await Order.findAll({
            where,
            include: [
                { model: User, as: 'Client', attributes: ['nickname', 'avatar'] },
                { model: User, as: 'Companion', attributes: ['nickname', 'avatar'] },
                { model: Game, attributes: ['name', 'icon'] }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({ code: 200, data: orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

// Accept Order (Companion)
exports.acceptOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const order = await Order.findOne({ where: { id, companion_id: user_id } });
        if (!order) {
            return res.status(404).json({ code: 404, msg: '订单不存在' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ code: 400, msg: '订单状态不合法' });
        }

        order.status = 'accepted';
        await order.save();

        res.json({ code: 200, msg: '订单已接受' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

// Complete Order (User)
exports.completeOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        // Only client can complete? Or companion? Usually client confirms.
        const order = await Order.findOne({ where: { id, user_id } });
        if (!order) {
            return res.status(404).json({ code: 404, msg: '订单不存在' });
        }

        if (order.status !== 'accepted') {
            return res.status(400).json({ code: 400, msg: '订单状态不合法' });
        }

        order.status = 'completed';
        order.completed_at = new Date();
        await order.save();
        
        // Transfer money: Client -> Companion
        // Note: In a real system, we should use a transaction and check balance first.
        const client = await User.findByPk(order.user_id);
        const companion = await User.findByPk(order.companion_id);
        
        if (client && companion) {
            client.balance = Number(client.balance) - Number(order.amount);
            companion.balance = Number(companion.balance) + Number(order.amount);
            await client.save();
            await companion.save();
        }

        res.json({ code: 200, msg: '订单已完成' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

// Cancel Order (User/Companion)
exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const order = await Order.findOne({ 
            where: { 
                id, 
                [Op.or]: [{ user_id }, { companion_id: user_id }]
            } 
        });

        if (!order) {
            return res.status(404).json({ code: 404, msg: '订单不存在' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ code: 400, msg: '已接受的订单无法取消' });
        }

        order.status = 'cancelled';
        await order.save();

        res.json({ code: 200, msg: '订单已取消' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

// Evaluate Order (Client only, after completed)
exports.evaluateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const { rating, review } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ code: 400, msg: '请选择 1-5 星评分' });
        }

        const order = await Order.findOne({ where: { id, user_id } });
        if (!order) {
            return res.status(404).json({ code: 404, msg: '订单不存在' });
        }
        if (order.status !== 'completed') {
            return res.status(400).json({ code: 400, msg: '仅能对已完成的订单进行评价' });
        }
        if (order.rating != null) {
            return res.status(400).json({ code: 400, msg: '该订单已评价' });
        }

        order.rating = Math.floor(Number(rating));
        order.review = review != null ? String(review).trim() : null;
        order.evaluated_at = new Date();
        await order.save();

        res.json({ code: 200, msg: '评价成功', data: order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

// Get All Orders (Admin)
exports.getAllOrders = async (req, res) => {
    try {
        const { keyword } = req.query;
        // In real app, keyword could search order_no or user name
        const where = {};
        if (keyword) {
            where.order_no = { [Op.like]: `%${keyword}%` };
        }

        const orders = await Order.findAll({
            where,
            include: [
                { model: User, as: 'Client', attributes: ['nickname'] },
                { model: User, as: 'Companion', attributes: ['nickname'] },
                { model: Game, attributes: ['name'] }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({ code: 200, data: orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};
