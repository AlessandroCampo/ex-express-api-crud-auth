const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();
const CustomError = require('../utils/CustomError');
const prismaErorrHandler = require('../utils/prismaErorrHandler.js');
const bcrpyt = require('bcrypt');
const { hashPassword } = require('../utils/passwordUtils.js');
const generateToken = require('../middlewares/jwtToken.js');
const generateResetToken = require('../middlewares/jwtResetToken.js');
const path = require('path');


const fs = require('fs');
const { sendResetPasswordEmail } = require('../utils/mailer.js');

const register = async (req, res, next) => {
    const { username, email, password, image } = req.body;
    console.log(image)

    const data = {
        username,
        email,
        password: await hashPassword(password),
        avatar: image || null
    }

    try {
        const newUser = await prisma.user.create({ data })
        const token = generateToken(newUser);
        return res.json({
            message: 'Your account has been succesfully created',
            user: {
                username: newUser.username,
                email: newUser.email,
                profilePic: newUser.avatar
            },
            token
        })
    } catch (err) {
        const customError = prismaErorrHandler(err);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        next(customError);
    }
}

const login = async (req, res, next) => {
    const user = req.body.user;
    if (!user) {
        throw new CustomError("User not found", "Error retrieving your user data", 404)
    }
    const token = generateToken(user);
    res.json({
        message: "Login succesful",
        user: {
            username: user.username,
            email: user.email,
            profile_picture: user.avatar
        },
        token
    })
}

const follow = async (req, res, next) => {
    const { userId } = req.body;
    const userToFollowId = req.params.userId;

    try {
        if (Number(userId) === Number(userToFollowId)) {
            throw new CustomError("Self Follow", "I appreciate the self-esteem, but you cannot follow your own account", 400)
        }
        const followedUser = await prisma.user.update({
            where: { id: Number(userToFollowId) },
            data: {
                followedBy: {
                    connect: { id: Number(userId) }
                }
            },
            select: {
                username: true,
                email: true,
                followedBy: {
                    select: {
                        username: true
                    }
                }
            }
        })
        return res.json({
            message: `You succesfully started following ${followedUser.username}`,
            followedUser
        })
    } catch (err) {
        const customError = prismaErorrHandler(err);
        next(customError);
    }
}

const unfollow = async (req, res, next) => {
    const { userId } = req.body;
    const userToUnfollowId = req.params.userId;

    try {
        const unfollowedUser = await prisma.user.update({
            where: { id: Number(userToUnfollowId) },
            data: {
                followedBy: {
                    disconnect: { id: Number(userId) }
                }
            },
            select: {
                username: true,
                email: true,
                followedBy: {
                    select: {
                        username: true
                    }
                }
            }
        })
        return res.json({
            message: `You succesfully unfollowed ${unfollowedUser.username}`,
            unfollowedUser
        })
    } catch (err) {
        const customError = prismaErorrHandler(err);
        next(customError);
    }
}

const resetPassword = async (req, res, next) => {
    const { userId, password } = req.body;

    try {
        const hashedNewPassword = await hashPassword(password);
        const user = await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword }
        })
        res.json({
            message: 'Your password has been succesfully updated'
        })
    } catch (err) {
        const customError = prismaErorrHandler(err);
        next(customError);
    }
}

const sendResetMail = async (req, res, next) => {
    const { userId } = req.body;
    try {
        const requestingUser = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        const resetToken = generateResetToken(requestingUser, "20m")
        sendResetPasswordEmail(requestingUser.email, resetToken)

        return res.json({
            message: `An email to ${requestingUser.email} has been sent with the instructions to reset your password`
        });

    } catch (err) {
        const customError = prismaErorrHandler(err);
        next(customError);
    }
};

const sendResetPage = async (req, res, next) => {
    try {
        const filePath = path.join(__dirname, '../views/resetPassword.html');
        res.sendFile(filePath);
    } catch (err) {
        next(err);
    }
};



module.exports = {
    register, login, follow, unfollow, resetPassword, sendResetMail, sendResetPage
}