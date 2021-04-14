import express from 'express';
import * as CategoryController from '../controllers/categoryController';
import * as PostController from '../controllers/postController';
import * as ReplyController from '../controllers/replyController';
import { signToken, verifyToken } from '../controllers/Authentication';

const router = express.Router();

router.all('*', (req, res, next) => {
    res.set({ 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' });
    next();
});

// Authentication Route
router.post('/login', signToken);

//  Reply Route
router
    .route('/post/:slug/reply/:id?')
    .post(ReplyController.postReply)
    .delete(ReplyController.deleteReply);

//  Post Route
router.get('/posts/:category?', PostController.getPosts);

router.get('/tags/:tag', PostController.getPostsWithTag);

router
    .route('/post/:slug?')
    .get(PostController.getPost)
    .post(verifyToken, PostController.postPost)
    .put(verifyToken, PostController.putPost)
    .delete(verifyToken, PostController.deletePost);

// Category Route
router.get('/categories', CategoryController.getCategories);

router
    .route('/category/:name?')
    .post(verifyToken, CategoryController.postCategory)
    .put(verifyToken, CategoryController.putCategory)
    .delete(verifyToken, CategoryController.deleteCategory);

export default router;
