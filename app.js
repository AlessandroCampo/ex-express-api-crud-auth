const express = require('express');
const { createServer } = require('node:http');
const app = express();

const { initializeSocket, userSocketMap } = require('./socket.js');
const server = createServer(app);
initializeSocket(server);
const { Server } = require('socket.io');



const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const port = process.env.PORT || 3000;
const globalErrorHandler = require('./middlewares/globalErrorHandler.js');


//routers import
const postRouter = require('./routers/postRouter.js');
const userRouter = require('./routers/userRouter.js');
const commentRotuer = require('./routers/commentRouter.js');
const messagesRouter = require('./routers/messagesRouter.js');


//cors handler
app.use(cors());


//Secuirty middlewares
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 100
// });
// app.use(limiter);


//Generic middlewares
app.use(express.json());
app.use(express.static('public'));
app.use((req, res, next) => {
    req.io = require('./socket.js').getIo();
    next();
});

app.use(express.urlencoded({ extended: true }));
app.use('/posts', postRouter);
app.use('/users', userRouter);
app.use('/comments', commentRotuer);
app.use('/messages', messagesRouter)





app.use((req, res, next) => {
    res.status(404).json({ error: `Could not find route  ${req.originalUrl}` });
});

app.use(globalErrorHandler);


server.listen(port, () => {
    console.log(`server listening on http://localhost:${port}`)
})


module.exports = {
    userSocketMap
}