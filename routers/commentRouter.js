const express = require('express');
const router = express.Router();

const commentController = require('../controllers/commentsController.js');
const auth = require('../middlewares/auth.js');
const isUserComment = require('../middlewares/isUserComment.js');
const schemas = require('../validations/postValidations.js');
const validator = require('../middlewares/validator.js');


router.put("/:commentId", auth, isUserComment, validator(schemas.comment), commentController.update);
router.delete("/:commentId", auth, isUserComment, commentController.destroy);
router.post("/:commentId/like", auth, commentController.likeComment);




module.exports = router;