module.exports = class CustomError extends Error {
    constructor(title, message, status) {
        super(message);
        this.title = title;
        this.status = status;
        this.name = this.constructor.name;
    }
}
