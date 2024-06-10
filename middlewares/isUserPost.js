const CustomError = require('../utils/CustomError');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new CustomError("User not found", "Error retrieving user data", 404);
        }

        const { id } = req.user;
        const { slug } = req.params;
        const user = await prisma.user.findUnique({ where: { id } });
        const post = await prisma.post.findUnique({ where: { slug } });

        if (!post) {
            throw new CustomError("Post not found", `Post with slug ${slug} was not found`, 404);
        }

        if (user.id !== post.userId) {
            throw new CustomError("Insufficient permission", "You are only allowed to update or delete your own posts", 401);
        }

        next();
    } catch (err) {
        next(err);
    }
};
