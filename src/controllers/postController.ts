import { NextFunction, Request, Response } from 'express';
import marked from 'marked';
import DBManager from '../models/database';
import { Reply } from '../models/reply';

type Next = NextFunction;

export default class PostController {
    static readonly maxPostsPerPage = 10;

    public static async getPosts(req: Request, res: Response, next: Next) {
        try {
            const posts = await PostController.findPostsFromDB(req.params.category);
            PostController.sendPostsList(req, res, posts);
        } catch (error) {
            res.status(404).send(error.message);
        }
        next();
    }

    public static async getPostsWithTag(req: Request, res: Response, next: Next) {
        try {
            const posts = await DBManager.instance.findPostsWithTag(req.params.tag);
            PostController.sendPostsList(req, res, posts);
        } catch (error) {
            res.status(404).send(error.message);
        }
        next();
    }

    private static sendPostsList(req: Request, res: Response, posts: any[] | void) {
        if (posts) {
            const page = Number(req.query.page || 1) - 1;
            const postsAtIndex = PostController.sliceByIndex(posts, page);
            res.status(200).json({ posts: postsAtIndex, totalLength: posts.length });
        }
    }

    public static async getPost(req: Request, res: Response, next: Next) {
        try {
            const url = decodeURI(req.params.slug);
            const post = await DBManager.instance.findOnePost({ url });
            if (post) res.json(post);
        } catch (error) {
            res.status(404).send(error.message);
        }
        next();
    }

    public static async postPost(req: Request, res: Response, next: Next) {
        try {
            const post = { ...req.body, formattedBody: marked(req.body.body) };
            await DBManager.instance.savePost(post);
            res.status(200).json({ url: req.body.url });
        } catch (error) {
            res.status(400).send(error.message);
        }
        next();
    }

    public static async putPost(req: Request, res: Response, next: Next) {
        try {
            const url = decodeURI(req.params.slug);
            const post = { ...req.body, formattedBody: marked(req.body.body) };
            await DBManager.instance.updatePost({ url }, post);
            res.status(200).json({ url: req.body.url });
        } catch (error) {
            res.status(400).send(error.message);
        }
        next();
    }

    public static async deletePost(req: Request, res: Response, next: Next) {
        try {
            const url = decodeURI(req.params.slug);
            await DBManager.instance.deletePost({ url });
            res.sendStatus(200);
        } catch (error) {
            res.status(404).send(error.message);
        }
        next();
    }

    public static async postReply(req: Request, res: Response, next: Next) {
        try {
            const url = decodeURI(req.params.slug);
            const reply = new Reply(req.body.nickname, req.body.password, req.body.body);
            await DBManager.instance.updatePost(
                { url },
                { $push: { replies: reply }, $inc: { repliesNum: 1 } }
            );
            res.status(200).json({
                nickname: reply.nickname,
                body: reply.body,
                writtenTime: reply.writtenTime,
            });
        } catch (error) {
            res.status(400).send(error.message);
        }
        next();
    }

    public static async deleteReply(req: Request, res: Response, next: Next) {
        try {
            const url = decodeURI(req.params.slug);
            const _id = req.params.id;
            await DBManager.instance.updatePost(
                { url },
                { $pull: { replies: { _id } }, $inc: { repliesNum: -1 } }
            );

            res.status(200).end();
        } catch (error) {
            res.status(400).send(error.message);
        }
        next();
    }

    private static async findPostsFromDB(category: string | undefined) {
        if (category) {
            return await DBManager.instance.findPostsInCategory(category);
        } else {
            return await DBManager.instance.findAllPosts();
        }
    }

    private static sliceByIndex(posts: any[], page: number): any[] {
        return posts.slice(
            page * PostController.maxPostsPerPage,
            page * PostController.maxPostsPerPage + PostController.maxPostsPerPage
        );
    }
}
