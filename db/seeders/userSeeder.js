

const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
const prismaErrorHandler = require('../../utils/prismaErorrHandler.js')

const createRandomUsers = async (count) => {
    const newUsers = [];
    for (let i = 0;i < count;i++) {
        const hashedPassword = await bcrypt.hash(faker.internet.password(), 10);
        newUsers.push({
            username: faker.internet.userName(),
            email: faker.internet.email(),
            avatar: faker.image.avatarGitHub(),
            password: hashedPassword
        })
    }

    try {
        const count = await prisma.user.createMany({
            data: newUsers
        })

        console.log(count + ' users have been created ')
    } catch (err) {
        const newError = prismaErrorHandler(err)
        throw new newError
    }
}

createRandomUsers(50);

// console.log(faker.internet.password())