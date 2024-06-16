const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();
const prismaErorrHandler = require('../utils/prismaErorrHandler.js');
const { userSocketMap } = require("../socket.js");



const sendMessage = async (req, res, next) => {
    const { userId, recId, content, recUser } = req.body;
    const data = {
        senderId: Number(userId),
        recipientId: Number(recId),
        content
    }
    try {

        const newMessage = await prisma.message.create({ data });
        const recipientSocketId = userSocketMap.get(recId);
        console.log(recipientSocketId)

        if (recipientSocketId) {
            // Emit a socket event to notify the recipient about the new message
            req.io.to(recipientSocketId).emit('newMessage', {
                senderId: userId,
                recipientId: recId,
                content,
                sentAt: newMessage.createdAt
            });
        }
        return res.json({
            message: `A new message has been sent to ${recUser.username}`,
            sentMessage: {
                recipient: recUser.username,
                status: newMessage.status,
                content: newMessage.content
            }
        })
    } catch (err) {
        const customError = prismaErorrHandler(err);
        next(customError);
    }
};

module.exports = { sendMessage };