import { Schema } from 'mongoose';
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

export default ReplySchema;

export class Reply {
    nickname: string;
    body: string;
    password: string;
    writtenTime: string;
    reReplies: any[];

    public constructor(nickname: string, password: string, body: string) {
        this.nickname = nickname;
        this.password = password;
        this.body = body;
        this.writtenTime = DateTime.now().toString();
        this.reReplies = [];
    }
}
