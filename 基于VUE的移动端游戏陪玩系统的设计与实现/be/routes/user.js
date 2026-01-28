const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/stats', userController.getDashboardStats);
router.get('/all', userController.getAllUsers);
// router.put('/:id/status', userController.updateUserStatus);

module.exports = router;
