import { NextFunction, Request, Response } from 'express';
import marked from 'marked';
import DBManager from '../models/database';
import { Reply } from '../models/reply';

export default class PostController {
    static readonly maxPostsToShow = 10;

    public static async getPosts(req: Request, res: Response, next: NextFunction) {
        let posts;
        if (req.params.category) {
            posts = await DBManager.instance.findPostsInCategory(req.params.category);
        } else {
            posts = await DBManager.instance.findAllPosts();
        }

        if (posts instanceof Error) {
            res.status(404).send(posts.message);
        } else {
            const index = Number(req.query.idx || 0);
            const postsAtIndex = PostController.sliceByIndex(posts, index);
            res.status(200).json(postsAtIndex);
        }
        next();
    }

    public static async getPost(req: Request, res: Response, next: NextFunction) {
        const url = decodeURI(req.params.slug);
        const post = await DBManager.instance.findOnePost({ url });

        if (post instanceof Error) res.status(404).json({ message: 'Post does not exist.' });
        else res.status(200).json(post);
        next();
    }

    public static async postPost(req: Request, res: Response, next: NextFunction) {
        const post = { ...req.body, formattedBody: marked(req.body.body) };
        await DBManager.instance.savePost(post);
        res.status(200).json({ url: req.body.url });
        next();
    }

    public static async putPost(req: Request, res: Response, next: NextFunction) {
        const url = decodeURI(req.params.slug);
        const post = { ...req.body, formattedBody: marked(req.body.body) };
        await DBManager.instance.updatePost({ url }, post);
        res.status(200).json({ url: req.body.url });
        next();
    }

    public static async deletePost(req: Request, res: Response, next: NextFunction) {
        const url = decodeURI(req.params.slug);
        await DBManager.instance.deletePost({ url });
        res.sendStatus(200);
        next();
    }

    public static async postReply(req: Request, res: Response, next: NextFunction) {
        const url = decodeURI(req.params.slug);
        const reply = new Reply(req.body.nickname, req.body.password, req.body.body);
        await DBManager.instance.updatePost(
            { url },
            { $push: { replies: reply }, $inc: { repliesNum: 1 } }
        );

        res.sendStatus(200);
        next();
    }

    public static async deleteReply(req: Request, res: Response, next: NextFunction) {
        const url = decodeURI(req.params.slug);
        const _id = req.params.id;
        await DBManager.instance.updatePost(
            { url },
            { $pull: { replies: { _id } }, $inc: { repliesNum: -1 } }
        );

        res.sendStatus(200);
        next();
    }

    private static sliceByIndex(posts: any[], idx: number): any[] {
        return posts.slice(
            idx * PostController.maxPostsToShow,
            idx * PostController.maxPostsToShow + PostController.maxPostsToShow
        );
    }
}
