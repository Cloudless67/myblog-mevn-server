import { Request, Response } from 'express';
import { createReplyDocument, Reply } from '../models/reply';
import DBManager from '../models/database';
import { isError } from '../types/isError';
import { compare, hash, isValidToken } from './Authentication';

async function postReply(req: Request, res: Response) {
    try {
        const url = decodeURI(req.params.slug);
        req.body.password = await hash(req.body.password);

        const reply = createReplyDocument(req.body.nickname, req.body.password, req.body.body);
        await DBManager.instance.postReply(url, reply);

        res.status(200).json(reply);
    } catch (error) {
        if (isError(error)) res.status(400).send(error.message);
    }
}

async function deleteReply(req: Request, res: Response) {
    const url = decodeURI(req.params.slug);
    const id = req.params.id;
    const authorization = req.headers.authorization;
    const isAuthorized = authorization && isValidToken(authorization.split(' ')[1]);

    if (isAuthorized) {
        try {
            await DBManager.instance.deleteReply(url, id);
            res.status(200).end();
        } catch (error) {
            if (isError(error)) res.status(400).send(error.message);
        }
    } else {
        try {
            const post = await DBManager.instance.findOnePost({ url });
            const replies: Reply[] = post.replies;
            const hashed = replies.find(x => x._id.toString() === id)?.password || '';
            const isCorrectPassword = await compare(req.body.password, hashed);

            if (isCorrectPassword) {
                await DBManager.instance.deleteReply(url, id);
                res.status(200).end();
            } else {
                res.status(403).send('Wrong password');
            }
        } catch (error) {
            if (isError(error)) res.status(400).send(error.message);
        }
    }
}

export { postReply, deleteReply };
