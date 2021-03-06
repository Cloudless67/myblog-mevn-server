import { Request, Response } from 'express';
import marked from '../marked';
import DBManager from '../models/database';
import { isError } from '../types/isError';
import { PostRaw, PostPreview, PutPostData } from '../types/post';

declare module 'express-session' {
    interface Session {
        visited?: string[];
    }
}

function bodyPreview(body: string) {
    return body.substring(0, Math.min(body.indexOf('#') > 0 ? body.indexOf('#') : 160, 160));
}

function preview(docs: PostRaw[]): PostPreview[] {
    return docs.map(x => {
        return {
            title: x.title,
            url: x.url,
            preview: bodyPreview(x.body),
            writtenTime: x.writtenTime,
            views: x.views,
            repliesNum: x.repliesNum,
        };
    });
}

async function getPosts(req: Request, res: Response) {
    try {
        const page = Number(req.query.page || 1);
        if (req.params.category) {
            const { docs, totalPages } = await DBManager.instance.findPostsInCategory(
                req.params.category,
                page
            );
            res.status(200).json({ posts: preview(docs), totalLength: totalPages });
        } else {
            const { docs, totalPages } = await DBManager.instance.findAllPosts(page);

            res.status(200).json({ posts: preview(docs), totalLength: totalPages });
        }
    } catch (error) {
        if (isError(error)) res.status(404).send(error.message);
    }
}

async function getPostsWithTag(req: Request, res: Response) {
    try {
        const page = Number(req.query.page || 1);
        const { docs, totalPages } = await DBManager.instance.findPostsWithTag(
            req.params.tag,
            page
        );
        res.status(200).json({ posts: preview(docs), totalLength: totalPages });
    } catch (error) {
        if (isError(error)) res.status(404).send(error.message);
    }
}

async function getPost(req: Request, res: Response) {
    const url = decodeURI(req.params.slug);
    const auth = req.headers.authorization;
    const isLoggedIn = auth !== undefined && auth.split(' ')[1] !== 'null';

    try {
        const post = await DBManager.instance.findOnePost({ url });

        if (post) {
            const visitedPost = req.session.visited;
            const isFirstVisit = visitedPost === undefined || !visitedPost.includes(url);

            if (!isLoggedIn && isFirstVisit) {
                DBManager.instance.updatePost({ url }, { $inc: { views: 1 } });
                req.session.visited = visitedPost ? [...visitedPost, url] : [url];
                req.session.save();
            }
            res.json(post);
        }
    } catch (error) {
        if (isError(error)) res.status(404).send(error.message);
    }
}

function getPostFromRequestBody<BodyType extends PutPostData>(requestBody: BodyType) {
    return {
        ...requestBody,
        formattedBody: marked.parse(requestBody.body),
        tags: requestBody.tags ? requestBody.tags.split(',') : [],
    };
}

async function postPost(req: Request, res: Response) {
    try {
        const post = getPostFromRequestBody(req.body);
        await DBManager.instance.savePost(post);
        res.status(200).json({ url: req.body.url });
    } catch (error) {
        if (isError(error)) res.status(400).send(error.message);
    }
}

async function putPost(req: Request, res: Response) {
    try {
        const url = decodeURI(req.params.slug);
        const post = getPostFromRequestBody(req.body);
        await DBManager.instance.updatePost({ url }, post);
        res.status(200).json({ url });
    } catch (error) {
        if (isError(error)) res.status(400).send(error.message);
    }
}

async function deletePost(req: Request, res: Response) {
    try {
        const url = decodeURI(req.params.slug);
        await DBManager.instance.deletePost({ url });
        res.sendStatus(200);
    } catch (error) {
        if (isError(error)) res.status(404).send(error.message);
    }
}

export { getPosts, getPostsWithTag, getPost, postPost, putPost, deletePost };
