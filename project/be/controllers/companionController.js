const CompanionService = require('../models/companionService');
const User = require('../models/user');
const Game = require('../models/game');
const Order = require('../models/order');
const { Op, fn, col } = require('sequelize');

// Get list (Public - with filters)
exports.getServices = async (req, res) => {
    try {
        const { game_id, keyword } = req.query;
        const where = {
            audit_status: 'approved',
            status: true // Only show online companions
        };

        if (game_id) {
            where.game_id = game_id;
        }

        const services = await CompanionService.findAll({
            where,
            include: [
                { 
                    model: User, 
                    attributes: ['id', 'nickname', 'avatar'],
                    where: keyword ? { nickname: { [Op.like]: `%${keyword}%` } } : undefined
                },
                { model: Game, attributes: ['id', 'name', 'icon'] }
            ],
            order: [['created_at', 'DESC']]
        });

        // 计算每个陪玩用户的评价统计（平均评分 / 评价数），与详情页逻辑保持一致
        const userIds = [...new Set(services.map(s => s.user_id).filter(Boolean))];
        let statsMap = {};
        if (userIds.length > 0) {
            const stats = await Order.findAll({
                where: {
                    companion_id: { [Op.in]: userIds },
                    rating: { [Op.ne]: null }
                },
                attributes: [
                    'companion_id',
                    [fn('COUNT', col('id')), 'evaluation_count'],
                    [fn('AVG', col('rating')), 'average_rating']
                ],
                group: ['companion_id']
            });

            statsMap = stats.reduce((map, row) => {
                const json = row.toJSON();
                const avg = Number(json.average_rating || 0);
                map[json.companion_id] = {
                    evaluation_count: Number(json.evaluation_count || 0),
                    average_rating: Number(avg.toFixed(1))
                };
                return map;
            }, {});
        }

        const data = services.map(service => {
            const json = service.toJSON();
            const stat = statsMap[json.user_id] || { evaluation_count: 0, average_rating: 0 };
            json.evaluation_count = stat.evaluation_count;
            json.average_rating = stat.average_rating;
            return json;
        });

        res.json({ code: 200, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

// Apply (User)
exports.applyService = async (req, res) => {
    try {
        const { game_id, price, description } = req.body;
        const user_id = req.user.id;

        // Check if already applied for this game
        const existing = await CompanionService.findOne({ where: { user_id, game_id } });
        if (existing) {
            return res.status(400).json({ code: 400, msg: '该游戏的陪玩服务已存在' });
        }

        const service = await CompanionService.create({
            user_id,
            game_id,
            price,
            description
        });

        res.status(201).json({ code: 200, msg: '申请已提交', data: service });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

// Update my service info (price / description)
exports.updateMyService = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const { price, description } = req.body;

        const service = await CompanionService.findOne({ where: { id, user_id } });
        if (!service) {
            return res.status(404).json({ code: 404, msg: '陪玩服务不存在' });
        }

        if (price !== undefined) {
            service.price = price;
        }
        if (description !== undefined) {
            service.description = description;
        }

        await service.save();
        res.json({ code: 200, msg: '陪玩服务已更新', data: service });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

// Get My Services (User)
exports.getMyServices = async (req, res) => {
    try {
        const user_id = req.user.id;
        const services = await CompanionService.findAll({
            where: { user_id },
            include: [{ model: Game, attributes: ['name'] }]
        });
        res.json({ code: 200, data: services });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

// Toggle Status (User)
exports.toggleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const service = await CompanionService.findOne({ where: { id, user_id } });
        if (!service) {
            return res.status(404).json({ code: 404, msg: '陪玩服务不存在' });
        }
        
        if (service.audit_status !== 'approved') {
            return res.status(400).json({ code: 400, msg: '陪玩服务尚未通过审核' });
        }

        service.status = !service.status;
        await service.save();

        res.json({ code: 200, msg: '状态更新成功', data: { status: service.status } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

// Get Audit List (Admin)
exports.getAuditList = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        if (status) where.audit_status = status;

        const services = await CompanionService.findAll({
            where,
            include: [
                { model: User, attributes: ['nickname', 'avatar'] },
                { model: Game, attributes: ['name'] }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({ code: 200, data: services });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

// Audit (Admin)
exports.auditService = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // approved, rejected

        const service = await CompanionService.findByPk(id);
        if (!service) {
            return res.status(404).json({ code: 404, msg: '陪玩服务不存在' });
        }

        service.audit_status = status;
        // If approved, auto set status to online (or let user do it)
        // Let's just update audit status.
        
        await service.save();

        // If approved, update user is_companion = true
        if (status === 'approved') {
            await User.update({ is_companion: true }, { where: { id: service.user_id } });
        }

        res.json({ code: 200, msg: '审核完成' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

exports.getDetail = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ code: 400, msg: '缺少id参数' });
        }
        const service = await CompanionService.findByPk(id, {
            include: [
                { model: User, attributes: ['id', 'nickname', 'avatar'] },
                { model: Game, attributes: ['id', 'name', 'icon'] }
            ]
        });
        if (!service) {
            return res.status(404).json({ code: 404, msg: '陪玩服务不存在' });
        }

        const companionUserId = service.user_id;
        const evaluation_count = await Order.count({
            where: { companion_id: companionUserId, rating: { [Op.ne]: null } }
        });
        const evaluatedOrders = await Order.findAll({
            where: { companion_id: companionUserId, rating: { [Op.ne]: null } },
            attributes: ['rating']
        });
        const sum = evaluatedOrders.reduce((s, o) => s + Number(o.rating), 0);
        const average_rating = evaluation_count > 0 ? (sum / evaluation_count).toFixed(1) : 0;

        const data = service.toJSON();
        data.evaluation_count = evaluation_count;
        data.average_rating = Number(average_rating);

        res.json({ code: 200, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};
