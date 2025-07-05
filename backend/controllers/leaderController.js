const leaderboardService = require('../services/leaderboardService');

exports.getLeaderboard = async (req, res) => {
  try {
    const board = await leaderboardService.getLeaderboard();
    res.status(200).json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
};