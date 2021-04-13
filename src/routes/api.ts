import express from 'express';
import CategoryController from '../controllers/categoryController';
import PostController from '../controllers/postController';

const router = express.Router();

router.all('*', (req, res, next) => {
    res.set({ 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' });
    next();
});

router.get('/posts/:category?', PostController.getPosts);

router.get('/tags/:tag', PostController.getPostsWithTag);

router
    .route('/post/:slug/reply/:id?')
    .post(PostController.postReply)
    .delete(PostController.deleteReply);

router
    .route('/post/:slug?')
    .get(PostController.getPost)
    .post(PostController.postPost)
    .put(PostController.putPost)
    .delete(PostController.deletePost);

router.get('/categories', CategoryController.getCategories);

router
    .route('/category/:name?')
    .post(CategoryController.postCategory)
    .put(CategoryController.putCategory)
    .delete(CategoryController.deleteCategory);

export default router;
