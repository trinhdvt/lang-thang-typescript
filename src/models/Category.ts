import {BelongsToMany, Column, ForeignKey, Model, Table} from "sequelize-typescript";
import Post from "./Post";

@Table({
    tableName: "category"
})
class Category extends Model {

    @Column({
        primaryKey: true,
        autoIncrement: true
    })
    id!: Number;

    @Column
    name!: String;

    @BelongsToMany(() => Post, () => PostCategory)
    postCategory?: Post[];
}

@Table({
    tableName: "post_category"
})
class PostCategory extends Model {

    @ForeignKey(() => Post)
    @Column({
        primaryKey: true
    })
    postId!: Number;

    @ForeignKey(() => Category)
    @Column({
        primaryKey: true
    })
    categoryId!: Number;
}

export {Category, PostCategory};