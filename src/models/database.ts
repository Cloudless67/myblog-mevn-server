import { connect, connection, disconnect, Document, Model } from 'mongoose';
import CategorySchema, { ICategory } from './category';
import PostSchema, { IPost } from './post';

type ValidSubdomains = 'www' | 'ee';

const connectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    bufferCommands: false,
};

export default class DatabaseManager {
    private static _instance: DatabaseManager | undefined;

    private Category!: Model<ICategory>;
    private Post!: Model<IPost>;

    public static get instance() {
        if (!this._instance) {
            this._instance = new DatabaseManager();
        }
        return this._instance;
    }

    public async connect(url?: string) {
        const uri = process.env.DB_URL! + (url || process.env.DB_DEFAULT!);
        connect(uri, connectOptions);

        console.log('Successfully connected to mongodb!');

        connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

        this.updateModels();
    }

    public async disconnect() {
        try {
            await disconnect();
        } catch (error) {
            console.error(error);
        }
    }

    public changeDatabase(dbName: ValidSubdomains) {
        connection.useDb(dbName, { useCache: true });
        this.updateModels();
    }

    public async saveCategory(category: object) {
        return await this.trySaveDocToDb(new this.Category(category));
    }

    public async savePost(post: object) {
        return await this.trySaveDocToDb(new this.Post(post));
    }

    public async findOneCategory(where: object) {
        const doc = await this.findCategories(where);
        return doc instanceof Array ? doc[0] : doc;
    }

    public async findAllCategories() {
        return await this.Category.find({}).catch(this.throwError);
    }

    public async findAllPosts(page: number) {
        return await this.findPosts({}, page);
    }

    public async findPostsInCategory(category: string, page: number) {
        return await this.findPosts({ category }, page);
    }

    public async findPostsWithTag(tag: string, page: number) {
        return await this.findPosts({ tags: tag }, page);
    }

    public async findOnePost(where: object) {
        const doc = await this.Post.find(where).catch(this.throwError);
        return doc instanceof Array ? doc[0] : doc;
    }

    private async findPosts(where: object, page: number) {
        const postPerPage = 10;
        const query = await this.Post.aggregate()
            .match(where)
            .facet({
                docs: [{ $skip: postPerPage * (page - 1) }, { $limit: postPerPage }],
                totalPages: [{ $count: 'count' }],
            });

        return { docs: query[0].docs, totalPages: query[0].totalPages[0].count };
    }

    private async findCategories(where: object) {
        return await this.Category.find(where).catch(this.throwError);
    }

    public async updateCategory(where: object, query: object) {
        return await this.Category.updateOne(where, query).catch(this.throwError);
    }

    public async updatePost(where: object, query: object) {
        return await this.Post.updateOne(where, query).catch(this.throwError);
    }

    public async postReply(postUrl: string, reply: object) {
        const res = await this.updatePost(
            { url: postUrl },
            { $push: { replies: reply }, $inc: { repliesNum: 1 } }
        );
    }

    public async deleteReply(postUrl: string, replyId: string) {
        await this.updatePost(
            { url: postUrl },
            { $pull: { replies: { _id: replyId } }, $inc: { repliesNum: -1 } }
        );
    }

    public async deleteCategory(where: object) {
        return await this.Category.deleteOne(where).catch(this.throwError);
    }

    public async deletePost(condition: object) {
        return await this.Post.deleteOne(condition).catch(this.throwError);
    }

    private async trySaveDocToDb(document: Document) {
        return await document.save().catch(this.throwError);
    }

    private constructor() {}

    private updateModels(): void {
        this.Category = connection.model<ICategory>('Category', CategorySchema);
        this.Post = connection.model<IPost>('Post', PostSchema);
    }

    public async dropDatabase() {
        await connection.dropDatabase();
    }

    private throwError(e: any): void {
        throw e;
    }
}
