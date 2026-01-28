const { Op } = require('sequelize');
const RefundRequest = require('../models/refundRequest');
const Order = require('../models/order');
const User = require('../models/user');
const sequelize = require('../config/db');

// 用户发起退款申请
exports.applyRefund = async (req, res) => {
    try {
        const { order_id, reason } = req.body;
        const user_id = req.user.id;

        const order = await Order.findOne({
            where: { id: order_id, user_id },
        });

        if (!order) {
            return res.status(404).json({ code: 404, msg: '订单不存在' });
        }

        if (order.status !== 'completed') {
            return res.status(400).json({ code: 400, msg: '仅已完成的订单可申请退款' });
        }

        const existing = await RefundRequest.findOne({
            where: {
                order_id: order.id,
                status: { [Op.in]: ['pending', 'approved'] }
            }
        });

        if (existing) {
            return res.status(400).json({ code: 400, msg: '该订单已存在退款申请' });
        }

        const refund = await RefundRequest.create({
            order_id: order.id,
            applicant_id: user_id,
            amount: order.amount,
            reason
        });

        res.status(201).json({ code: 200, msg: '退款申请已提交', data: refund });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

// 用户查看自己的退款申请
exports.getMyRefunds = async (req, res) => {
    try {
        const user_id = req.user.id;

        const refunds = await RefundRequest.findAll({
            where: { applicant_id: user_id },
            include: [
                { model: Order, as: 'Order', attributes: ['order_no', 'amount', 'status'] }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({ code: 200, data: refunds });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

// 管理员查询退款申请列表
exports.getAllRefunds = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ code: 403, msg: '无权限访问' });
        }

        const { status, keyword } = req.query;
        const where = {};

        if (status) {
            where.status = status;
        }

        if (keyword) {
            where[Op.or] = [
                { '$Order.order_no$': { [Op.like]: `%${keyword}%` } },
                { '$Applicant.nickname$': { [Op.like]: `%${keyword}%` } },
                { '$Order.Companion.nickname$': { [Op.like]: `%${keyword}%` } }
            ];
        }

        const refunds = await RefundRequest.findAll({
            where,
            include: [
                {
                    model: Order,
                    as: 'Order',
                    attributes: ['order_no', 'amount', 'user_id', 'companion_id'],
                    include: [
                        { model: User, as: 'Companion', attributes: ['nickname'], required: false }
                    ]
                },
                { model: User, as: 'Applicant', attributes: ['nickname'] }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({ code: 200, data: refunds });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

// 管理员审核通过
exports.approveRefund = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        if (req.user.role !== 'admin') {
            await t.rollback();
            return res.status(403).json({ code: 403, msg: '无权限访问' });
        }

        const { id } = req.params;

        const refund = await RefundRequest.findByPk(id, {
            include: [{ model: Order, as: 'Order' }],
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!refund) {
            await t.rollback();
            return res.status(404).json({ code: 404, msg: '退款申请不存在' });
        }

        if (refund.status !== 'pending') {
            await t.rollback();
            return res.status(400).json({ code: 400, msg: '退款申请状态不合法' });
        }

        const order = refund.Order;
        if (!order || order.status !== 'completed') {
            await t.rollback();
            return res.status(400).json({ code: 400, msg: '仅已完成订单可退款' });
        }

        const client = await User.findByPk(order.user_id, { transaction: t, lock: t.LOCK.UPDATE });
        const companion = await User.findByPk(order.companion_id, { transaction: t, lock: t.LOCK.UPDATE });

        if (!client || !companion) {
            await t.rollback();
            return res.status(400).json({ code: 400, msg: '用户信息不存在' });
        }

        client.balance = Number(client.balance) + Number(refund.amount);
        companion.balance = Number(companion.balance) - Number(refund.amount);
        await client.save({ transaction: t });
        await companion.save({ transaction: t });

        refund.status = 'approved';
        refund.processed_at = new Date();
        await refund.save({ transaction: t });

        await t.commit();
        res.json({ code: 200, msg: '退款已通过' });
    } catch (error) {
        console.error(error);
        await t.rollback();
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

// 管理员拒绝退款
exports.rejectRefund = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ code: 403, msg: '无权限访问' });
        }

        const { id } = req.params;

        const refund = await RefundRequest.findByPk(id);
        if (!refund) {
            return res.status(404).json({ code: 404, msg: '退款申请不存在' });
        }

        if (refund.status !== 'pending') {
            return res.status(400).json({ code: 400, msg: '退款申请状态不合法' });
        }

        refund.status = 'rejected';
        refund.processed_at = new Date();
        await refund.save();

        res.json({ code: 200, msg: '已拒绝退款申请' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

