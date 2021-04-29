export default {
    directives: {
        defaultSrc: ["'self'"],
        imgSrc: ['*', 'data:'],
        scriptSrcElem: ["'self'", 'https://kit.fontawesome.com/bb93986db9.js'],
        styleSrcElem: [
            "'self'",
            "'unsafe-inline'",
            'https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-coy.min.css',
            'https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css',
        ],
        fontSrc: ["'self'", 'https://cdn.jsdelivr.net/', 'https://ka-f.fontawesome.com/'],
        connectSrc: ["'self'", 'https://ka-f.fontawesome.com'],
    },
};
