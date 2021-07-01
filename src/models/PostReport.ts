import {BelongsTo, Column, DefaultScope, ForeignKey, Model, Table} from "sequelize-typescript";
import Account from "./Account";
import Post from "./Post";

@DefaultScope(() => ({
    order: [
        ['solved', 'DESC'],
        ['reportedDate', 'DESC']
    ]
}))
@Table({
    tableName: "post_report"
})
class PostReport extends Model {
    @Column({
        primaryKey: true,
        autoIncrement: true
    })
    id!: Number;

    @ForeignKey(() => Account)
    @Column
    accountId!: Number;

    @BelongsTo(() => Account)
    account!: Account;

    @ForeignKey(() => Post)
    @Column
    postId!: Number;

    @BelongsTo(() => Post)
    post!: Post;

    @Column
    reportedDate?: Date;

    @Column
    content?: String;

    @Column({
        field: "is_solved",
        defaultValue: false
    })
    solved?: Boolean;

    @Column
    decision?: String;
}

export default PostReport;