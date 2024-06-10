const express = require('express');
const app = express();
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

//cors handler
app.use(cors());


//Secuirty middlewares
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);
app.use(helmet());

//Generic middlewares
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use('/posts', postRouter);
app.use('/users', userRouter);
app.use('/comments', commentRotuer);





app.use((req, res, next) => {
    res.status(404).json({ error: `Could not find route  ${req.originalUrl}` });
});

app.use(globalErrorHandler);


app.listen(port, () => {
    console.log(`server listening on http://localhost:${port}`)
})