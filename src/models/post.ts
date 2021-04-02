import { Document, Schema } from 'mongoose';
import { DateTime } from 'luxon';
import ReplySchema from './reply';

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

export default PostSchema;

export interface IPost extends Document {
    title: string;
    url: string;
    category: string;
    body: string;
    formattedBody: string;
    tags: string[];
    writtenTime: Date;
    views: number;
    replies: any[];
    repliesNum: number;
}
