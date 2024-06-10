const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();
const CustomError = require('../utils/CustomError');
const prismaErorrHandler = require('../utils/prismaErorrHandler.js');
const bcrpyt = require('bcrypt');
const { hashPassword } = require('../utils/passwordUtils.js');
const generateToken = require('../middlewares/jwtToken.js');
const fs = require('fs');

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
                email: newUser.email
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



module.exports = {
    register, login, follow, unfollow
}