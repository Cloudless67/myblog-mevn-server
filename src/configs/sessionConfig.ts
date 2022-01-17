import MongoStore from 'connect-mongo';

const SECRET = process.env.JWT_SECRET || 'secret';
const NODE_ENV = process.env.NODE_ENV;

export default function (store: MongoStore) {
    return {
        secret: SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: NODE_ENV === 'production', httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
        store,
    };
}
