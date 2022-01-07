type PostRaw = {
    title: string;
    url: string;
    thumbnail?: string;
    body: string;
    writtenTime: string;
    views: number;
    repliesNum: number;
};

type PostPreview = {
    title: string;
    url: string;
    thumbnail?: string;
    preview: string;
    writtenTime: string;
    views: number;
    repliesNum: number;
};

export { PostRaw, PostPreview };
