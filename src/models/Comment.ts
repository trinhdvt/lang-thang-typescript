import {BelongsTo, BelongsToMany, Column, ForeignKey, Model, Table} from "sequelize-typescript";
import Post from "./Post";
import Account from "./Account";

@Table({
    tableName: "comment"
})
class Comment extends Model {

    @Column({
        primaryKey: true,
        autoIncrement: true
    })
    id!: Number;

    @ForeignKey(() => Post)
    @Column
    postId!: Number;

    @BelongsTo(() => Post)
    post!: Post;

    @ForeignKey(() => Account)
    @Column
    accountId!: Number;

    @BelongsTo(() => Account)
    account!: Account;

    @Column
    content!: String;

    @Column
    commentDate!: Date

    @BelongsToMany(() => Account, () => CommentLike)
    likedAccount?: Account[];
}

@Table({
    tableName: "comment_like"
})
class CommentLike extends Model {

    @ForeignKey(() => Comment)
    @Column({
        primaryKey: true,
    })
    commentId!: Number;

    @ForeignKey(() => Account)
    @Column({
        primaryKey: true,
    })
    accountId!: Number;

}


export {Comment, CommentLike};