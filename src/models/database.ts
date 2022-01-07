import {
    connect,
    connection,
    disconnect,
    Document,
    FilterQuery,
    Model,
    UpdateQuery,
} from 'mongoose';
import { PostRaw } from '../types/post';
import { CategoryObject } from '../types';
import Reply from '../types/reply';
import PostSchema, { IPost } from './post';
import CategorySchema, { ICategory } from './category';

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
        const DB_URL = process.env.DB_URL || '';
        const DB_DEFAULT = process.env.DB_DEFAULT || '';

        const uri = DB_URL + (url || DB_DEFAULT);

        try {
            await connect(uri, connectOptions);
            console.log('Successfully connected to mongodb!');
            this.updateModels();
        } catch (error) {
            console.error('MongoDB connection error:', error);
        }
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

    public async saveCategory(category: CategoryObject) {
        return await this.trySaveDocToDb(new this.Category(category));
    }

    public async savePost(post: PostRaw) {
        return await this.trySaveDocToDb(new this.Post(post));
    }

    public async findOneCategory(where: FilterQuery<ICategory>) {
        const doc = await this.findCategories(where);
        return doc instanceof Array ? doc[0] : doc;
    }

    public async findAllCategories() {
        return await this.Category.find({});
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

    public async findOnePost(where: FilterQuery<IPost>) {
        const doc = await this.Post.find(where);
        return doc instanceof Array ? doc[0] : doc;
    }

    private async findPosts(where: FilterQuery<IPost>, page: number) {
        const postPerPage = 10;
        const query = await this.Post.aggregate()
            .match(where)
            .sort({ _id: -1 })
            .facet({
                docs: [{ $skip: postPerPage * (page - 1) }, { $limit: postPerPage }],
                totalPages: [{ $count: 'count' }],
            });

        const docs: PostRaw[] = query[0].docs;
        const totalPages: number = query[0].totalPages[0].count;

        return { docs, totalPages };
    }

    private async findCategories(where: FilterQuery<ICategory>) {
        return await this.Category.find(where);
    }

    public async updateCategory(where: FilterQuery<ICategory>, query: UpdateQuery<ICategory>) {
        return await this.Category.updateOne(where, query);
    }

    public async updatePost(where: FilterQuery<IPost>, query: UpdateQuery<IPost>) {
        return await this.Post.updateOne(where, query);
    }

    public async postReply(postUrl: string, reply: Reply) {
        await this.updatePost(
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

    public async deleteCategory(where: FilterQuery<ICategory>) {
        return await this.Category.deleteOne(where);
    }

    public async deletePost(condition: FilterQuery<IPost>) {
        return await this.Post.deleteOne(condition);
    }

    private async trySaveDocToDb(document: Document) {
        return await document.save();
    }

    private updateModels(): void {
        this.Category = connection.model<ICategory>('Category', CategorySchema);
        this.Post = connection.model<IPost>('Post', PostSchema);
    }

    public async dropDatabase() {
        await connection.dropDatabase();
    }
}
