import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import logger from 'morgan';
import helmet from 'helmet';

import apiRouter from './routes/api';
import DatabaseManager from './models/database';

dotenv.config();

const app = express();

app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRouter);

app.use(/[^/]+/, (req, res) => {
    res.redirect('/');
});

if (process.env.NODE_ENV !== 'test') {
    DatabaseManager.instance.connect();
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server listening on port ${process.env.PORT || 3000}`);
    });
}

export default app;
