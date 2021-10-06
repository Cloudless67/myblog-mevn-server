import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import logger from 'morgan';
import history from 'connect-history-api-fallback';
import helmet from 'helmet';
import expressStaticGzip from 'express-static-gzip';
import cspOptions from './cspOptions';

import apiRouter from './routes/api';
import DatabaseManager from './models/database';

dotenv.config();

const app = express();

app.use(helmet({ contentSecurityPolicy: cspOptions }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', apiRouter);

app.use(history());

app.use(
    '/',
    expressStaticGzip(path.join(__dirname, 'public'), {
        enableBrotli: true,
        orderPreference: ['br'],
    })
);

if (process.env.NODE_ENV !== 'test') {
    DatabaseManager.instance.connect();
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server listening on port ${process.env.PORT || 3000}`);
    });
}

export default app;
