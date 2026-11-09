const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Match = require('../models/Match');
const Message = require('../models/Message');
const User = require('../models/User');
const { isBlockedEitherWay } = require('../utils/blockAccess');

const registerSocketHandlers = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (typeof token !== 'string' || !token) return next(new Error('Unauthorized'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('_id name images');
      if (!user) return next(new Error('Unauthorized'));
      socket.user = user;
      return next();
    } catch {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    // Never trust a client-provided user ID for room membership.
    socket.join(String(socket.user._id));

    socket.on('setup', () => {
      socket.join(String(socket.user._id));
    });

    socket.on('join chat', async (matchId) => {
      try {
        if (typeof matchId !== 'string' || !mongoose.isValidObjectId(matchId)) return;
        const match = await Match.findById(matchId).select('participants');
        if (!match || !match.participants.some(id => String(id) === String(socket.user._id))) return;
        const other = match.participants.map(String).find(id => id !== String(socket.user._id));
        if (!other || await isBlockedEitherWay(socket.user._id, other)) return;
        socket.join(String(matchId));
      } catch {
        socket.emit('chat error', { message: 'Unable to join conversation.' });
      }
    });

    socket.on('new message', async (payload) => {
      try {
        const { matchId, content } = payload || {};
        if (typeof matchId !== 'string' || !mongoose.isValidObjectId(matchId)) return;
        if (typeof content !== 'string' || !content.trim() || content.length > 2000) return;
        const match = await Match.findById(matchId).select('participants');
        if (!match) return;
        const senderId = String(socket.user._id);
        if (!match.participants.some(id => String(id) === senderId)) return;
        const receiverId = match.participants.map(String).find(id => id !== senderId);
        if (!receiverId || await isBlockedEitherWay(senderId, receiverId)) {
          socket.emit('chat error', { message: 'Conversation unavailable.' });
          return;
        }
        const message = await Message.create({
          sender: senderId,
          receiver: receiverId,
          matchId,
          content: content.trim(),
        });
        await Match.findByIdAndUpdate(matchId, {
          lastMessage: message.content,
          lastMessageAt: message.createdAt,
        });
        // User rooms are bound to authenticated identity. Never broadcast to stale
        // match rooms: a user may have blocked their counterpart after joining.
        io.to(senderId).to(receiverId).emit('message received', message);
      } catch {
        socket.emit('chat error', { message: 'Unable to send message.' });
      }
    });
  });
};

module.exports = { registerSocketHandlers };
