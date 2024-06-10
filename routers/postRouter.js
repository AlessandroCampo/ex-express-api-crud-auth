const express = require('express');
const router = express.Router();


const postController = require('../controllers/postController.js');


//validation middlewares

const validator = require('../middlewares/validator.js');
const schemas = require('../validations/postValidations.js');
const uploadFile = require('../middlewares/checkImage.js');
const auth = require('../middlewares/auth.js');
const isUserPost = require('../middlewares/isUserPost.js');


router.post('/', auth, uploadFile, validator(schemas.post), postController.create)
router.get('/', postController.index)
router.get('/:slug', validator(schemas.postSlug), postController.show)
router.put('/:slug', auth, isUserPost, validator(schemas.postSlug), validator(schemas.post), postController.update)
router.delete('/:slug', auth, isUserPost, validator(schemas.postSlug), postController.destroy)
router.patch('/:slug/change-visibility', auth, isUserPost, validator(schemas.postSlug), postController.changeVisibility);
router.patch('/:slug/content', auth, isUserPost, validator(schemas.postSlug), validator(schemas.postContent), postController.editContent);
router.post('/:slug/comment', auth, validator(schemas.postSlug), validator(schemas.comment), postController.comment)
router.post('/:slug/like', auth, validator(schemas.postSlug), validator(schemas.like), postController.like)
router.delete('/:slug/like', auth, validator(schemas.postSlug), validator(schemas.like), postController.removeLike)




module.exports = router;