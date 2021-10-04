import { Schema, Types } from 'mongoose';
import { DateTime } from 'luxon';

const ReplySchema: Schema = new Schema();

ReplySchema.add({
    nickname: String,
    body: String,
    password: String,
    writtenTime: {
        type: Date,
        default: DateTime.now().toString(),
    },
    reReplies: [ReplySchema],
});

function createReplyDocument(nickname: string, password: string, body: string) {
    const reply: Reply = {
        _id: Types.ObjectId(),
        nickname: nickname,
        password: password,
        body: body,
        writtenTime: DateTime.now().toString(),
        reReplies: [],
    };
    return reply;
}

export default ReplySchema;

export { createReplyDocument };

export type Reply = {
    _id: Types.ObjectId;
    nickname: string;
    body: string;
    password: string;
    writtenTime: string;
    reReplies: Reply[];
};
