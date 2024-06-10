const { PrismaClient } = require("@prisma/client");
const prismaErorrHandler = require('../utils/prismaErorrHandler.js');
const prisma = new PrismaClient();



const likeComment = async (req, res, next) => {
    const { userId } = req.body;
    const { commentId } = req.params;

    try {
        const data = {
            userId, commentId,
        }
        prisma.like.create({ data })
        return res.json({
            message: `Your like has been added to the comment with id ${commentId}`
        })
    } catch (err) {
        const customError = prismaErorrHandler(err);
        next(customError);
    }
}

const destroy = async (req, res, next) => {
    const { commentId } = req.params;
    try {
        const deletedComment = await prisma.comment.delete({
            where: { id: Number(commentId) }
        })
        return res.json({
            message: `Comment with id ${commentId} has been succesfully deleted`,
            deletedComment
        })
    } catch (err) {
        const customError = prismaErorrHandler(err);
        next(customError);
    }

}


const update = async (req, res, next) => {
    const { commentId } = req.params;
    const { content } = req.body;
    try {
        const updatedComment = await prisma.comment.update({
            where: { id: Number(commentId) },
            data: {
                content
            }
        })
        return res.json({
            message: `Comment with id ${commentId}'s content has been succesfully updated`,
            newContent: updatedComment.content
        })
    } catch (err) {
        const customError = prismaErorrHandler(err);
        next(customError);
    }
}



module.exports = { likeComment, destroy, update }