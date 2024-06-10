const { PrismaClient } = require("@prisma/client");
const CustomError = require("../utils/CustomError");
const { isValidURL } = require("../utils/genericUtils");
const prisma = new PrismaClient();
const { comparePassword } = require('../utils/passwordUtils.js')



const user = {
    username: {
        in: ["body"],
        escape: true,
        notEmpty: {
            errorMessage: "Please select an username for your account",
            bail: true,
        },
        isAlphanumeric: {
            errorMessage: "Username must contain only letters and numbers",
            bail: true
        },
        isLength: {
            options: { min: 5, max: 50 },
            errorMessage: "Your username should be between 5 and 50 characters long.",
            bail: true
        },
        custom: {
            options: async (username) => {
                const foundUser = await prisma.user.findUnique({
                    where: { username }
                })
                if (foundUser) {
                    throw new CustomError('An user with this username already exists', `An user with username ${username} already exists. Please choose another username for your account`, 400)
                }
                return true
            }
        }
    },
    email: {
        in: ["body"],
        notEmpty: {
            errorMessage: "Email is required",
            bail: true,
        },
        isEmail: {
            errorMessage: "Invalid email address",
            bail: true
        },
        custom: {
            options: async (email) => {
                const foundUser = await prisma.user.findUnique({
                    where: { email }
                })
                if (foundUser) {
                    throw new CustomError('An user with this email already exists', `An user with email ${email} already exists. If you own that account, please log in with your data`, 400)
                }
                return true
            }
        }
    },
    password: {
        in: ["body"],
        notEmpty: {
            errorMessage: "Please insert a password for your account",
            bail: true,
        },
        isStrongPassword: {
            options: {
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 0,
                returnScore: false,
            },
            errorMessage: "Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
            bail: true
        }
    },
    image: {
        in: ["body"],
        optional: true,
        custom: {
            options: (url) => {
                const urlIsValid = isValidURL(url);
                if (!urlIsValid) {
                    throw new CustomError('Validation error', "The image field contains a non valid URL.", 400)
                }
                return true
            }
        }
    },
}


const login = {
    username: {
        in: ["body"],
        escape: true,
        notEmpty: {
            errorMessage: "Please enter a username before trying to login",
            bail: true,
        },
        isAlphanumeric: {
            errorMessage: "Your username is a combination of letters, numbers and symbols",
            bail: true
        },
        isLength: {
            options: { min: 5, max: 50 },
            errorMessage: "Your username is between 5 and 50 characters long.",
            bail: true
        },
        custom: {
            options: async (username, { req }) => {
                const foundUser = await prisma.user.findUnique({
                    where: { username }
                });
                if (!foundUser) {
                    throw new CustomError('Incorrect credentials', 'Username or password incorrect. You have a maximum of 5 login attempts. If you forgot your credentials, consider starting the recovery process', 400);

                }
                req.body.user = foundUser;
                return true;
            }
        }
    },
    password: {
        in: ["body"],
        notEmpty: {
            errorMessage: "Insert your password before trying to login",
            bail: true,
        },
        isLength: {
            options: {
                min: 8
            },
            errorMessage: "Your password is at least 8 characters long",
            bail: true
        },
        custom: {
            options: async (password, { req }) => {
                const user = req.body.user;
                if (!user) {
                    throw new CustomError('Invalid request', 'No user found for the provided username', 400);
                }

                if (user.failedLoginAttempts >= 5) {
                    throw new CustomError('Account suspended', 'Your account has beeen suspended for security reasons, please contact the admins at boolbook@support.com', 400);
                }

                const isPasswordValid = await comparePassword(password, user.password);
                if (!isPasswordValid) {
                    await prisma.user.update({
                        where: { username: user.username },
                        data: {
                            failedLoginAttempts: {
                                increment: 1
                            }
                        }
                    });
                    throw new CustomError('Incorrect credentials', 'Username or password incorrect. You have a maximum of 5 login attempts. If you forgot your credentials, consider starting the recovery process', 400);;
                }

                await prisma.user.update({
                    where: { username: user.username },
                    data: {
                        failedLoginAttempts: 0
                    }
                });

                return true;
            }
        }
    },
};


module.exports = {
    user, login
}