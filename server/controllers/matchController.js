const mongoose = require('mongoose');
const Interaction = require('../models/Interaction');
const Match = require('../models/Match');
const User = require('../models/User');

const getFeed = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select('-password');

    if (!currentUser) {
      return res.status(404).json({ message: 'Current user not found.' });
    }

    const coordinates = currentUser.location?.coordinates;
    const hasCoordinates =
      Array.isArray(coordinates) && coordinates.length === 2 && coordinates.every(Number.isFinite);

    if (!hasCoordinates) {
      return res.status(400).json({ message: 'Current user location is required for discovery.' });
    }

    const interactions = await Interaction.find({ user: currentUser._id }).select('targetUser');
    const swipedUserIds = interactions.map((item) => item.targetUser);

    const feedFilter = {
      _id: {
        $ne: new mongoose.Types.ObjectId(currentUser._id),
        $nin: swipedUserIds,
      },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates,
          },
        },
      },
    };

    if (currentUser.interestedIn && currentUser.interestedIn !== 'everyone') {
      feedFilter.gender = currentUser.interestedIn;
    }

    const users = await User.find(feedFilter)
      .select('name bio gender interestedIn images')
      .limit(25);

    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const swipe = async (req, res) => {
  try {
    const { targetUserId, action } = req.body;

    if (!mongoose.isValidObjectId(targetUserId) || !action) {
      return res.status(400).json({ message: 'targetUserId and action are required.' });
    }

    if (!['like', 'pass'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action.' });
    }

    if (String(targetUserId) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot swipe on yourself.' });
    }

    const targetUserExists = await User.exists({ _id: targetUserId });
    if (!targetUserExists) {
      return res.status(404).json({ message: 'Target user not found.' });
    }

    await Interaction.findOneAndUpdate(
      {
        user: req.user._id,
        targetUser: targetUserId,
      },
      {
        action,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    let isMatch = false;
    let matchedConversationId = null;

    if (action === 'like') {
      const reciprocalLike = await Interaction.findOne({
        user: targetUserId,
        targetUser: req.user._id,
        action: 'like',
      });

      isMatch = Boolean(reciprocalLike);

      if (isMatch) {
        const participants = [String(req.user._id), String(targetUserId)].sort();
        const pairKey = participants.join(':');
        const existingMatch = await Match.findOne({
          pairKey,
        });

        if (existingMatch) {
          matchedConversationId = existingMatch._id;
        } else {
          const createdMatch = await Match.create({ participants, pairKey });
          matchedConversationId = createdMatch._id;
        }
      }
    }

    return res.json({ success: true, match: isMatch, matchId: matchedConversationId });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMatches = async (req, res) => {
  try {
    const currentUserId = String(req.user._id);

    const matches = await Match.find({ participants: req.user._id })
      .populate('participants', 'name images bio')
      .sort({ lastMessageAt: -1, createdAt: -1 });

    const response = matches.map((match) => {
      const otherUser = match.participants.find(
        (participant) => String(participant._id) !== currentUserId
      );

      return {
        _id: match._id,
        user: otherUser
          ? {
              _id: otherUser._id,
              name: otherUser.name,
              images: otherUser.images,
              bio: otherUser.bio,
            }
          : null,
        lastMessage: match.lastMessage,
        lastMessageAt: match.lastMessageAt,
        createdAt: match.createdAt,
      };
    });

    return res.json(response.filter((item) => item.user));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFeed,
  getMatches,
  swipe,
};