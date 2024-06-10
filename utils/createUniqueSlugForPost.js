const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');
const CustomError = require('./CustomError');

module.exports = async (name) => {
    console.log(name);
    if (!name || typeof name !== 'string') {
        throw new CustomError('Validation error', 'The name field has not been received in a valid format', 400);
    }
    let newSlug = slugify(name);
    let slugExists = true;
    let counter = 1;
    do {
        slugExists = await prisma.post.findUnique({
            where: { slug: newSlug }
        });
        if (slugExists) {
            newSlug = `${slugify(name)}-${counter}`;
            counter++;
        }
    } while (slugExists);

    return newSlug.toLocalLowerCase();
};
