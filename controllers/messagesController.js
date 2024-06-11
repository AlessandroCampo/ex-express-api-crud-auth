const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();
const prismaErorrHandler = require('../utils/prismaErorrHandler.js');



const sendMessage = async (req, res, next) => {
    const { userId, recId, content, recUser } = req.body;
    const data = {
        senderId: Number(userId),
        recipientId: Number(recId),
        content
    }
    try {
        const newMessage = await prisma.message.create({ data });
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