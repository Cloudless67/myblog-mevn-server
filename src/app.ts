import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import logger from 'morgan';
import history from 'connect-history-api-fallback';
import helmet from 'helmet';
import expressStaticGzip from 'express-static-gzip';
import MongoStore from 'connect-mongo';
import cspOptions from './cspOptions';

import apiRouter from './routes/api';
import DatabaseManager from './models/database';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV;
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const DB_URL = (process.env.DB_URL || '') + (process.env.DB_DEFAULT || '');
const SECRET = process.env.JWT_SECRET || 'secret';

const app = express();

app.use(helmet({ contentSecurityPolicy: cspOptions }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
    session({
        secret: SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: NODE_ENV === 'production', httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
        store: MongoStore.create({
            mongoUrl: DB_URL,
        }),
    })
);

app.use('/api', apiRouter);

app.use(history());

app.use(
    '/',
    expressStaticGzip(path.join(__dirname, 'public'), {
        enableBrotli: true,
        orderPreference: ['br'],
    })
);

if (NODE_ENV !== 'test') {
    DatabaseManager.instance.connect();
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}

export default app;
