import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const saltRounds = 10;

export async function signToken(req: Request, res: Response) {
    const id = req.body.id;
    const password = req.body.password;

    if (id !== process.env.ID) {
        res.status(403).send('Invalid userID');
    } else {
        await verifyPassword(password, res);
    }
}

async function verifyPassword(password: any, res: Response) {
    try {
        const auth = await bcrypt.compare(password, process.env.PASSWORD!);
        if (auth) {
            const token = jwt.sign({ authorized: true }, process.env.JWT_SECRET!, {
                expiresIn: '1d',
            });
            res.status(200).json({ token });
        } else {
            res.status(403).send('Wrong password');
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
            await jwt.verify(token, process.env.JWT_SECRET!);
            next();
        } catch (error) {
            res.status(403).send(error.message);
        }
    } else {
        res.status(403).send('Missing authentication header!');
    }
}

export function isValidToken(token: string) {
    try {
        jwt.verify(token, process.env.JWT_SECRET!);
        return true;
    } catch (error) {
        return false;
    }
}

export async function hash(plain: string) {
    return await bcrypt.hash(plain, saltRounds);
}

export async function compare(plain: string, hashed: string) {
    return await bcrypt.compare(plain, hashed);
}
