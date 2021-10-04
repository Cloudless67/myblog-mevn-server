type Reply = {
    nickname: string;
    body: string;
    password: string;
    writtenTime: string;
    reReplies: Reply[];
};

export default Reply;
