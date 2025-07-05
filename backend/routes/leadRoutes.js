const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderController');

router.get('/', leaderboardController.getLeaderboard);

module.exports = router;