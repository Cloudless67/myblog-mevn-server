import { Document, Schema } from 'mongoose';
import { DateTime } from 'luxon';
import { Thumbnail } from '../types/post';
import ReplySchema, { Reply } from './reply';

const PostSchema: Schema = new Schema({
    title: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        unique: true,
    },
    category: {
        type: String,
        required: true,
    },
    thumbnail: {
        url: {
            type: String,
        },
        aspectRatio: {
            type: Number,
        },
    },
    body: {
        type: String,
        required: true,
    },
    formattedBody: {
        type: String,
        required: true,
    },
    tags: [String],
    writtenTime: {
        type: Date,
        default: DateTime.now().toString(),
    },
    views: {
        type: Number,
        default: 0,
    },
    replies: {
        type: [ReplySchema],
        default: [],
    },
    repliesNum: {
        type: Number,
        default: 0,
    },
});

interface IPost extends Document {
    title: string;
    url: string;
    category: string;
    thumbnail?: Thumbnail;
    body: string;
    formattedBody: string;
    tags: string[];
    writtenTime: Date;
    views: number;
    replies: Reply[];
    repliesNum: number;
}

export default PostSchema;

export { IPost };
