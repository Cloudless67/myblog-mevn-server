import { Request, Response } from 'express';
import marked from '../marked';
import DBManager from '../models/database';

const maxPostsPerPage = 10;

export async function getPosts(req: Request, res: Response) {
    try {
        const posts = await findPostsFromDB(req.params.category);
        sendPostsList(req, res, posts);
    } catch (error) {
        res.status(404).send(error.message);
    }
}

export async function getPostsWithTag(req: Request, res: Response) {
    try {
        const posts = await DBManager.instance.findPostsWithTag(req.params.tag);
        sendPostsList(req, res, posts);
    } catch (error) {
        res.status(404).send(error.message);
    }
}

export async function sendPostsList(req: Request, res: Response, posts: any[] | void) {
    if (posts) {
        const page = Number(req.query.page || 1) - 1;
        const postsAtIndex = sliceByIndex(posts, page);
        res.status(200).json({ posts: postsAtIndex, totalLength: posts.length });
    }
}

export async function getPost(req: Request, res: Response) {
    try {
        const url = decodeURI(req.params.slug);
        const post = await DBManager.instance.findOnePost({ url });
        if (post) res.json(post);
    } catch (error) {
        res.status(404).send(error.message);
    }
}

export async function postPost(req: Request, res: Response) {
    try {
        const post = {
            ...req.body,
            formattedBody: marked(req.body.body),
            tags: req.body.tags ? req.body.tags.split(',') : [],
        };
        await DBManager.instance.savePost(post);
        res.status(200).json({ url: req.body.url });
    } catch (error) {
        res.status(400).send(error.message);
    }
}

export async function putPost(req: Request, res: Response) {
    try {
        const url = decodeURI(req.params.slug);
        const post = {
            ...req.body,
            formattedBody: marked(req.body.body),
            tags: req.body.tags ? req.body.tags.split(',') : [],
        };
        await DBManager.instance.updatePost({ url }, post);
        res.status(200).json({ url });
    } catch (error) {
        console.log(req.body);
        res.status(400).send(error.message);
    }
}

export async function deletePost(req: Request, res: Response) {
    try {
        const url = decodeURI(req.params.slug);
        await DBManager.instance.deletePost({ url });
        res.sendStatus(200);
    } catch (error) {
        res.status(404).send(error.message);
    }
}

async function findPostsFromDB(category: string | undefined) {
    if (category) {
        return await DBManager.instance.findPostsInCategory(category);
    } else {
        return await DBManager.instance.findAllPosts();
    }
}

function sliceByIndex(posts: any[], page: number): any[] {
    return posts.slice(page * maxPostsPerPage, page * maxPostsPerPage + maxPostsPerPage);
}
