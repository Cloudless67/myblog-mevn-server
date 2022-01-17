export default {
    directives: {
        defaultSrc: ["'self'"],
        imgSrc: ['*', 'data:'],
        scriptSrcElem: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
        styleSrcElem: [
            "'self'",
            "'unsafe-inline'",
            'https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css',
            'fonts.googleapis.com',
        ],
        fontSrc: ["'self'", 'https://cdn.jsdelivr.net/', 'fonts.gstatic.com'],
        connectSrc: ["'self'"],
    },
};
