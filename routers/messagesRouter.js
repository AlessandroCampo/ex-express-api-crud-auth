const express = require('express');
const router = express.Router();

const messageController = require('../controllers/messagesController.js');
const auth = require('../middlewares/auth.js');
// const isUserComment = require('../middlewares/isUserComment.js');
const schemas = require('../validations/messageValidation.js');
const validator = require('../middlewares/validator.js');

router.post("/", auth, validator(schemas.newMessage), messageController.sendMessage);
router.get("/:interId");
router.put("/:messageId",);
router.delete("/:messageId",);





module.exports = router;