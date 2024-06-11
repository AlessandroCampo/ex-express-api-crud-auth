const { PrismaClient } = require("@prisma/client");
const CustomError = require("../utils/CustomError");
const prisma = new PrismaClient();


const newMessage = {
    content: {
        in: ["body"],
        escape: true,
        notEmpty: {
            errorMessage: "Please insert some text in your message",
            bail: true,
        },
        isString: {
            errorMessage: "The content of your message may only contain text",
            bail: true
        },
        isLength: {
            options: { max: 500 },
            errorMessage: "Your message should be  maximum 500 characters long.",
            bail: true
        }
    },
    recipientId: {
        in: ["body"],
        notEmpty: {
            errorMessage: "Could not find the recipient of your message",
            bail: true
        },
        isInt: {
            errorMessage: "There was an error sending your message, please try again",
            bail: true
        },
        custom: {
            options: async (recipientId, { req }) => {
                const foundUser = await prisma.user.findUnique({
                    where: { id: Number(recipientId) }
                })
                if (!foundUser) {
                    throw new CustomError('Not found', "The message has not been sent because the recipient's account was not found", 404)
                }
                if (!foundUser.id === Number(req.userId)) {
                    throw new CustomError('Cannot send messages to yourself', "If you're feeling lonely, I'm sure you can find a lot of new friends on our app, but you can't send messages to yourself", 400)
                }
                req.body.recUser = foundUser;
                req.body.recId = foundUser.id;
                return true
            }
        }
    }
}

module.exports = {
    newMessage
}