import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { isError } from '../types/isError';

const SALT_ROUNDS = 10;

async function signToken(req: Request, res: Response) {
    const id = req.body.id;
    const password = req.body.password;

    if (id !== process.env.ID) {
        res.status(403).send('Invalid userID');
    } else {
        const { status, payload } = await verifyPassword(password);
        res.status(status).send(payload);
    }
}

async function verifyPassword(password: string) {
    const PASSWORD = process.env.PASSWORD || '';
    const JWT_SECRET = process.env.JWT_SECRET || '';

    try {
        const auth = await bcrypt.compare(password, PASSWORD);
        if (auth) {
            const token = jwt.sign({ authorized: true }, JWT_SECRET, {
                expiresIn: '1d',
            });
            return { status: 200, payload: { token } };
        } else {
            return { status: 403, payload: 'Wrong password' };
        }
    } catch (error) {
        if (isError(error)) return { status: 403, payload: error.message };
        else return { status: 400, payload: 'Unknown error occurred.' };
    }
}

async function verifyToken(req: Request, res: Response, next: NextFunction) {
    const JWT_SECRET = process.env.JWT_SECRET || '';

    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
            await jwt.verify(token, JWT_SECRET);
            next();
        } catch (error) {
            if (isError(error)) res.status(403).send(error.message);
        }
    } else {
        res.status(403).send('Missing authentication header!');
    }
}

function isValidToken(token: string) {
    const JWT_SECRET = process.env.JWT_SECRET || '';

    try {
        jwt.verify(token, JWT_SECRET);
        return true;
    } catch (error) {
        return false;
    }
}

async function hash(plain: string) {
    return await bcrypt.hash(plain, SALT_ROUNDS);
}

async function compare(plain: string, hashed: string) {
    return await bcrypt.compare(plain, hashed);
}

export { signToken, verifyToken, isValidToken, hash, compare, verifyPassword };
