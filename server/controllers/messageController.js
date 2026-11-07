const mongoose = require('mongoose');
const Match = require('../models/Match');
const Message = require('../models/Message');

const getMessagesForMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const currentUserId = String(req.user._id);
    if (!mongoose.isValidObjectId(matchId)) return res.status(400).json({ message: 'Invalid conversation ID.' });

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found.' });
    }

    const isParticipant = match.participants.some(
      (participantId) => String(participantId) === currentUserId
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'You are not allowed to access this chat.' });
    }

    const messages = await Message.find({ matchId })
      .sort({ createdAt: -1 })
      .limit(100)
      .select('sender receiver matchId content createdAt updatedAt');

    return res.json(messages.reverse());
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMessagesForMatch,
};