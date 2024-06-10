const { Prisma } = require('@prisma/client');
const CustomError = require('./CustomError');

function handlePrismaError(err) {
    console.log(err)
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        let title, message, status;

        switch (err.code) {
            case 'P2002':
                const uniqueFields = err.meta.target;
                title = 'ConflictError';
                if (Array.isArray(uniqueFields)) {
                    message = `A unique constraint failed on the fields: ${uniqueFields.join(', ')}`;
                } else {
                    message = `A unique constraint failed on the field: ${uniqueFields}`;
                }
                status = 409;
                break;

            case 'P2003':
                const foreignKeyField = err.meta.field_name;
                title = 'ForeignKeyError';
                message = `Foreign key constraint failed on the field: ${foreignKeyField}`;
                status = 409;
                break;
            case 'P2001':
                let missingField = err.meta.target;
                title = 'NotFoundError';
                if (Array.isArray(missingField)) {
                    message = `The record with the specified ${missingField.join(', ')} was not found.`;
                } else {
                    message = `The record with the specified ${missingField} was not found.`;
                }
                status = 404;
                break;
            default:
                title = 'DatabaseError';
                message = 'A database error occurred';
                status = 400;
        }

        return new CustomError(title, message, status);
    } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        return new CustomError('UnknownRequestError', 'An unknown request error occurred', 500);
    } else if (err instanceof Prisma.PrismaClientRustPanicError) {
        return new CustomError('RustPanicError', 'A panic in the Rust engine occurred', 500);
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
        return new CustomError('InitializationError', 'An error occurred during the client initialization', 500);
    } else if (err instanceof Prisma.PrismaClientValidationError) {
        const validationErrors = err.message.match(/Argument `(.+?)` is missing/);
        const field = validationErrors ? validationErrors[1] : 'Unknown';
        return new CustomError('ValidationError', `Validation error occurred on the field: ${field}`, 400);
    } else {
        return new CustomError('UnknownError', 'An unknown error occurred', 500);
    }
}

module.exports = handlePrismaError;
