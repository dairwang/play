const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const followController = require('../controllers/followController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/stats', userController.getDashboardStats);
router.get('/all', userController.getAllUsers);
router.put('/update/:id', userController.updateUser);
router.delete('/delete/:id', userController.deleteUser);

// 关注相关：关注/取消关注/是否已关注（合并到用户路由）
router.get('/:id/follow/check', followController.check);
router.post('/:id/follow', followController.follow);
router.delete('/:id/follow', followController.unfollow);

module.exports = router;
