const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();
const CustomError = require('../utils/CustomError');
const prismaErorrHandler = require('../utils/prismaErorrHandler.js');
const createUniqueSlugForPost = require('../utils/createUniqueSlugForPost.js');
const tagsFromPostContent = require('../utils/tagsFromPost.js');


const create = async (req, res, next) => {
    const { name, content, published, userId, image } = req.body;
    const user = req.user;
    const defaultName = name ? name : `${user.username.toLowerCase()}-${new Date().toISOString()}`;
    const toSlugString = content.split(" ").slice(0, 3).join(" ");

    const data = {
        name: defaultName,
        content,
        published,
        image,
        slug: await createUniqueSlugForPost(toSlugString),
        userId: Number(userId)
    };

    try {
        // Extract tags from post content using AI utility function
        const postTags = await tagsFromPostContent(content);

        // Create or find tags and collect their IDs
        const tagIds = [];
        if (postTags && postTags.length > 0) {
            for (const tag of postTags) {
                let existingTag = await prisma.tag.findFirst({
                    where: { name: tag }
                });
                if (!existingTag) {
                    existingTag = await prisma.tag.create({
                        data: { name: tag }
                    });
                }
                tagIds.push(existingTag.id);
            }
        }

        // Create the new post
        console.log(tagIds)
        const newPost = await prisma.post.create({
            data: {
                ...data,
                Tag: {
                    connect: tagIds.map(id => ({ id }))
                }
            },
            include: {
                user: true,
                likes: true,
                comments: true,
                Tag: true
            }

        })

        return res.json({
            message: 'New post has been successfully created',
            newPost
        });
    } catch (err) {
        const customError = prismaErorrHandler(err);
        next(customError);
    }
};

const index = async (req, res, next) => {
    //this function has been recycled in both posts and user controller, in order to be able to return  either all posts or just the selected user posts
    const where = {};
    const { page = 1, limit = 10, published, containedString } = req.query;
    const { userId } = req.params;
    if (published) where.published = published === 'true';
    if (containedString) where.name = { contains: containedString };
    if (userId) where.userId = Number(userId)



    const offset = (page - 1) * limit;
    const totalPosts = await prisma.post.count({ where });
    const totalPages = Math.ceil(totalPosts / limit);

    try {

        const allPosts = await prisma.post.findMany({
            take: Number(limit),
            skip: offset,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        username: true,
                        avatar: true
                    }
                },
                comments: {
                    include: {
                        user: {
                            select: {
                                username: true,
                                avatar: true
                            }
                        }
                    }
                },
                likes: true
            },
            where
        });
        return res.json({
            message: `${allPosts.length} ${allPosts.length > 1 ? 'posts' : 'post'} have been found on page number ${page}`,
            allPosts,
            currentPage: page,
            totalPages
        })
    } catch (err) {
        const customError = prismaErorrHandler(err);
        next(customError);
    }
};

const userIndex = async (req, res, next) => {
    const where = {};
    const { page = 1, limit = 10, published, containedString } = req.query;
    const { userId } = req.params;
    if (!userId) {
        throw new CustomError("Authorization Error", "Could not retrieve your account's data, make sure you are logged in before trying to access your posts", 404)
    }

}


const show = async (req, res, next) => {
    const { slug } = req.params;
    try {
        const foundPost = await prisma.post.findUnique({
            where: { slug },
            include: {
                user: true,
                comments: {
                    include: {
                        user: {
                            select: {
                                username: true,
                                avatar: true
                            }
                        }
                    }
                },

                likes: true

            }
        });
        if (foundPost) {
            return res.json({
                message: `Post with slug ${slug} has succesfully been retrieved`,
                foundPost
            })
        }
        //TODO - add custom error
        throw new Error(`Post with slug ${slug} has not been found`)
    } catch (err) {
        const customError = prismaErorrHandler(err);
        next(customError);
    }
};



const update = async (req, res, next) => {
    const { slug } = req.params;
    const { name, content, published } = req.body;

    try {
        const updateData = {};
        if (name !== undefined) {
            updateData.name = name
            updateData.slug = await createUniqueSlugForPost(name)
        };
        if (content !== undefined) updateData.content = content;
        if (published !== undefined) updateData.published = published;

        const updatedPost = await prisma.post.update({
            where: { slug },
            data: updateData,
        });

        return res.json({
            message: `Post with slug ${slug} has successfully been updated`,
            updatedPost,
        });
    } catch (err) {
        const customError = prismaErorrHandler(err);
        next(customError);
    }
};



const destroy = async (req, res, next) => {
    const { slug } = req.params;
    try {
        const deletedPost = await prisma.post.delete({
            where: { slug }
        });
        res.json({
            message: `Post with slug ${slug} has successfully been deleted`,
            deletedPost,
        })
    } catch (err) {
        const customError = prismaErorrHandler(err);
        next(customError);
    }
};

const comment = async (req, res, next) => {
    const { slug } = req.params;
    const { content, userId, postId } = req.body;
    try {
        if (!postId) {
            throw new CustomError("Post not found", `Post with slug ${slug} was not found`, 404)
        }
        const data = {
            content, userId, postId

        }
        const newComment = await prisma.comment.create({
            data
        });
        res.json({
            message: `A new comment has been added to the post  with slug ${slug}`,
            newComment,
        })
    } catch (err) {
        const customError = prismaErorrHandler(err);
        next(customError);
    }

}

const like = async (req, res, next) => {
    const { slug } = req.params;
    const { userId, postId } = req.body;
    try {
        if (!postId) {
            throw new CustomError("Post not found", `Post with slug ${slug} was not found`, 404)
        }
        const data = {
            userId, postId

        }
        const newLike = await prisma.like.create({
            data
        });
        res.json({
            message: `A new like has been added to the post  with slug ${slug}`,
            newLike,
        })
    } catch (err) {
        const customError = prismaErorrHandler(err);
        next(customError);
    }



}

const removeLike = async (req, res, next) => {
    const { slug } = req.params;
    const { likeId } = req.body;
    try {
        if (!likeId) {
            throw new CustomError('Like not found', `You have not liked the post with slug ${slug}`, 404);
        }
        const remvoedLike = await prisma.like.delete({
            where: {
                id: likeId
            }
        });
        res.json({
            message: `Your like has been removed from the post  with slug ${slug}`,
            remvoedLike,
        })
    } catch (err) {
        const customError = prismaErorrHandler(err);
        next(customError);
    }


}
const changeVisibility = async (req, res, next) => {
    const { slug } = req.params;
    const { published } = req.body;
    console.log(Boolean(published))
    try {
        const modifiedPost = await prisma.post.update({
            where: { slug },
            data: {
                published: Boolean(Number(published))
            }
        })
        res.json({
            message: `Post with slug ${slug} has successfully been ${published ? 'published' : 'hidden'}`,
            modifiedPost,
        })
    } catch (error) {
        const customError = prismaErorrHandler(error);
        next(customError);
    }
}

const editContent = async (req, res, next) => {
    const { slug } = req.params;
    const { content } = req.body;
    try {
        const editedPost = await prisma.post.update({
            where: { slug },
            data: {
                content: content
            }
        })
        res.json({
            message: `Post with slug ${slug}'s content has successfully edited to ${content}`,
            editedPost,
        })
    } catch (error) {
        const customError = prismaErorrHandler(error);
        next(customError);
    }
}


module.exports = {
    index, show, create, update, destroy, comment, changeVisibility, editContent, like, removeLike
}