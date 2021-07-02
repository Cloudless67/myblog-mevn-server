import { Document, Schema } from 'mongoose';
import { CategoryObject } from '../types';

const CategorySchema: Schema = new Schema();

CategorySchema.add({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    //  Tree structures with children references
    isTopLevel: Boolean,
    children: [String],
});

export default CategorySchema;

export interface ICategory extends Document {
    name: string;
    isTopLevel: Boolean;
    children: string[];
}
