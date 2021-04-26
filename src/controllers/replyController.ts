import { Request, Response } from 'express';
import { Reply } from '../models/reply';
import DBManager from '../models/database';
import { compare, hash, isValidToken } from './Authentication';

export async function postReply(req: Request, res: Response) {
    try {
        const url = decodeURI(req.params.slug);
        req.body.password = await hash(req.body.password);

        const reply = new Reply(req.body.nickname, req.body.password, req.body.body);
        await DBManager.instance.postReply(url, reply);

        res.status(200).json(reply);
    } catch (error) {
        res.status(400).send(error.message);
    }
}

export async function deleteReply(req: Request, res: Response) {
    const url = decodeURI(req.params.slug);
    const id = req.params.id;

    if (req.headers.authorization && isValidToken(req.headers.authorization.split(' ')[1])) {
        try {
            await DBManager.instance.deleteReply(url, id);
            res.status(200).end();
        } catch (error) {
            res.status(400).send(error.message);
        }
    } else {
        try {
            const post: any = await DBManager.instance.findOnePost({ url });
            const replies: Reply[] = post.replies;
            const hashed = replies.find(x => x._id.toString() === id)!.password;

            if (await compare(req.body.password, hashed)) {
                await DBManager.instance.deleteReply(url, id);
                res.status(200).end();
            } else {
                res.status(403).send('Wrong password');
            }
        } catch (error) {
            res.status(400).send(error.message);
        }
    }
}
