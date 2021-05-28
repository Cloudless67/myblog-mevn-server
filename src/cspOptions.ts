export default {
    directives: {
        defaultSrc: ["'self'"],
        imgSrc: ['*', 'data:'],
        scriptSrcElem: ["'self'", 'https://kit.fontawesome.com/bb93986db9.js'],
        styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
        styleSrcElem: [
            "'self'",
            "'unsafe-inline'",
            'https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css',
            'fonts.googleapis.com',
        ],
        fontSrc: [
            "'self'",
            'https://cdn.jsdelivr.net/',
            'https://ka-f.fontawesome.com/',
            'fonts.gstatic.com',
        ],
        connectSrc: ["'self'", 'https://ka-f.fontawesome.com'],
    },
};
