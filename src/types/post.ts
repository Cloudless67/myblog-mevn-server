type Thumbnail = {
    url: string;
    aspectRatio: number;
};

type PostRaw = {
    title: string;
    url: string;
    thumbnail?: Thumbnail;
    body: string;
    writtenTime: string;
    views: number;
    repliesNum: number;
};

type PostPreview = {
    title: string;
    url: string;
    thumbnail?: Thumbnail;
    preview: string;
    writtenTime: string;
    views: number;
    repliesNum: number;
};

export { Thumbnail, PostRaw, PostPreview };
