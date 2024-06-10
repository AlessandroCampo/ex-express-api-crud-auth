const CustomError = require('../utils/CustomError');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new CustomError("User not found", "Error retrieving user data", 404);
        }

        const { id } = req.user;
        const { commentId } = req.params;
        const user = await prisma.user.findUnique({ where: { id } });
        const comment = await prisma.comment.findUnique({ where: { id: Number(commentId) } });

        if (!comment) {
            throw new CustomError("Comment not found", `Comment with id ${commentId} was not found`, 404);
        }

        if (user.id !== comment.userId) {
            throw new CustomError("Insufficient permission", "You are only allowed to update or delete your own comments", 401);
        }

        next();
    } catch (err) {
        next(err);
    }
};