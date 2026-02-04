const sequelize = require('../config/db');

/**
 * GET /api/wallet/flow/list
 * 根据 token 查询当前用户的资金流水（不分页，按时间倒序）
 * 每条记录包含：
 * - other_nickname / other_avatar：与之发生资金往来的对方（若无则为系统）
 * - amount / type / created_at：金额、类型、时间
 */
exports.getWalletFlowList = async (req, res) => {
    try {
        const user_id = req.user.id;

        // 使用一次查询把对方用户信息一并查出，避免在循环中多次请求数据库
        const [rows] = await sequelize.query(
            `
            SELECT
              wl.id,
              wl.user_id,
              wl.type,
              wl.amount,
              wl.related_id,
              wl.created_at,
              o.order_no,
              u_other.nickname AS other_nickname,
              u_other.avatar AS other_avatar
            FROM wallet_logs wl
            LEFT JOIN orders o
              ON o.id = wl.related_id
            LEFT JOIN users u_other
              ON u_other.id = (
                CASE
                  WHEN o.user_id = wl.user_id THEN o.companion_id
                  WHEN o.companion_id = wl.user_id THEN o.user_id
                  ELSE NULL
                END
              )
            WHERE wl.user_id = :user_id
            ORDER BY wl.created_at DESC
            `,
            {
                replacements: { user_id }
            }
        );

        // 与 userController 保持一致的返回格式
        res.json({ code: 200, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};

