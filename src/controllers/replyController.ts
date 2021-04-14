import { Request, Response } from 'express';
import { Reply } from '../models/reply';
import DBManager from '../models/database';

export async function postReply(req: Request, res: Response) {
    try {
        const url = decodeURI(req.params.slug);
        const reply = new Reply(req.body.nickname, req.body.password, req.body.body);
        await DBManager.instance.postReply(url, reply);

        res.status(200).json(reply);
    } catch (error) {
        res.status(400).send(error.message);
    }
}

export async function deleteReply(req: Request, res: Response) {
    try {
        DBManager.instance.deleteReply(decodeURI(req.params.slug), req.params.id);
        res.status(200).end();
    } catch (error) {
        res.status(400).send(error.message);
    }
}
