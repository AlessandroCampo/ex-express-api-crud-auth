const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const { index } = require('../controllers/postController.js');


const validator = require('../middlewares/validator.js');
const schemas = require('../validations/userValidations.js');
const uploadFile = require('../middlewares/checkImage.js');
const testMiddleware = require('../middlewares/testMiddleware.js');
const auth = require('../middlewares/auth.js');
const verifyResetToken = require('../middlewares/verifyResetToken.js');





router.post('/register', uploadFile, validator(schemas.user), userController.register);
router.post('/login', validator(schemas.login), userController.login);
router.get('/reset-password-mail', auth, userController.sendResetMail)
router.get('/reset-password', userController.sendResetPage)
router.post('/reset-password', verifyResetToken, validator(schemas.newPassword), userController.resetPassword)
router.get('/:userId/posts', index)
router.post('/:userId/follow', auth, userController.follow)
router.delete('/:userId/follow', auth, userController.unfollow)







module.exports = router;