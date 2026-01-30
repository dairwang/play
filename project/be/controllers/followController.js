const Follow = require('../models/follow');

// 关注用户：当前用户(req.user.id) 关注 targetUserId
exports.follow = async (req, res) => {
    try {
        const follower_id = req.user.id;
        const following_id = parseInt(req.params.id, 10);

        if (!following_id || following_id === follower_id) {
            return res.status(400).json({ code: 400, msg: '无法关注该用户' });
        }

        const [record, created] = await Follow.findOrCreate({
            where: { follower_id, following_id },
            defaults: { follower_id, following_id }
        });

        if (!created) {
            return res.json({ code: 200, msg: '已关注', data: { is_followed: true } });
        }

        res.json({ code: 200, msg: '关注成功', data: { is_followed: true } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

// 取消关注
exports.unfollow = async (req, res) => {
    try {
        const follower_id = req.user.id;
        const following_id = parseInt(req.params.id, 10);

        if (!following_id) {
            return res.status(400).json({ code: 400, msg: '参数错误' });
        }

        await Follow.destroy({
            where: { follower_id, following_id }
        });

        res.json({ code: 200, msg: '已取消关注', data: { is_followed: false } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

// 检查当前用户是否已关注目标用户
exports.check = async (req, res) => {
    try {
        const follower_id = req.user.id;
        const following_id = parseInt(req.params.id, 10);

        if (!following_id) {
            return res.status(400).json({ code: 400, msg: '缺少用户id' });
        }

        const record = await Follow.findOne({
            where: { follower_id, following_id }
        });

        res.json({ code: 200, data: { is_followed: !!record } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};
