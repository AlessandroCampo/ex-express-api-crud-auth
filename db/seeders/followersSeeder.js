
const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const prisma = new PrismaClient();
const prismaErrorHandler = require('../../utils/prismaErorrHandler.js')



const generateRandomFollows = async (max_followers) => {
    const allUsers = await prisma.user.findMany();
    const allUserIds = allUsers.map(u => ({ id: u.id }))
    try {
        for await (const user of allUsers) {
            const totalRandomFollowers = Math.floor(Math.random() * max_followers)
            const userRandomFollowers = allUserIds.sort((a, b) => 0.5 - Math.random()).slice(0, totalRandomFollowers)
            const totalRandomFollowing = Math.floor(Math.random() * max_followers)
            const userRandomFollowing = allUserIds.sort((a, b) => 0.5 - Math.random()).slice(0, totalRandomFollowing)
            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    followedBy: { connect: userRandomFollowers },
                    following: { connect: userRandomFollowing },
                }
            })
        }
    } catch (error) {
        const foundError = prismaErrorHandler(error);
        throw new foundError
    }

}


generateRandomFollows(50);