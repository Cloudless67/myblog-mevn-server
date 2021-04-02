'use strict';

const { watch, src, dest } = require('gulp');
const nodemon = require('nodemon');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');

function type(cb) {
    return tsProject.src().pipe(tsProject()).js.pipe(dest('dist'));
    cb();
}

function dev(cb) {
    watch('./src/**/*.ts', type);
    nodemon({
        script: 'dist/app.js',
        ext: 'js json',
    });
}

exports.type = type;

exports.dev = dev;

exports.default = () => {
    watch('./public/stylesheets/scss/**/*.scss', style);
};
