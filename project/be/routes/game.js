const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middleware/auth');

// Public: Get game list
router.get('/list', gameController.getGames);

// Admin only (Assuming we check role in middleware or controller, for now just auth)
router.post('/add', authMiddleware, gameController.createGame);
router.put('/update/:id', authMiddleware, gameController.updateGame);
router.delete('/delete/:id', authMiddleware, gameController.deleteGame);

module.exports = router;
