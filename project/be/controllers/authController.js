const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Secret key for JWT (Should be in .env in production)
const JWT_SECRET = process.env.JWT_SECRET || 'play_companion_secret_key_2024';

exports.register = async (req, res) => {
    try {
        const { username, password, nickname } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ code: 400, msg: '用户名已存在' });
        }

        // Create user (In real app, hash password here!)
        // const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            password, // Store plain text for now as per instruction, but highly not recommended for prod
            nickname
        });

        res.status(201).json({ code: 200, msg: '用户注册成功', data: { id: newUser.id, username: newUser.username } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: '服务器错误', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ code: 401, msg: '用户名或密码错误' });
        }

        // Check password (In real app, compare hash)
        if (user.password !== password) {
            return res.status(401).json({ code: 401, msg: '用户名或密码错误' });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            code: 200,
            msg: '登录成功',
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    nickname: user.nickname,
                    role: user.role,
                    avatar: user.avatar,
                    is_companion: user.is_companion,
                    balance: user.balance
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, msg: 'Server error', error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        // req.user is set by auth middleware
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        
        if (!user) {
            return res.status(404).json({ code: 404, msg: '用户不存在' });
        }

        res.json({ code: 200, data: user });
    } catch (error) {
        res.status(500).json({ code: 500, msg: '服务器错误' });
    }
};
