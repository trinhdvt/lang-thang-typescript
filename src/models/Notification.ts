import {BelongsTo, Column, ForeignKey, Model, Scopes, Table} from "sequelize-typescript";
import Account from "./Account";
import Post from "./Post";

@Scopes(() => ({
    "un-seen": {
        where: {
            seen: false
        },
        order: [['notifyDate', 'DESC']]
    }
}))
@Table({
    tableName: "notification"
})
class Notification extends Model {
    @Column({
        primaryKey: true,
        autoIncrement: true
    })
    id!: Number;

    @ForeignKey(() => Account)
    @Column
    accountId!: Number;

    @BelongsTo(() => Account, 'account_id')
    account!: Account;

    @Column
    content!: String;

    @Column
    notifyDate?: Date;

    @Column({
        field: "is_seen",
        defaultValue: false
    })
    seen?: Boolean;

    @ForeignKey(() => Post)
    @Column
    postId!: Number;

    @BelongsTo(() => Post)
    post!: Post;

    @ForeignKey(() => Account)
    @Column
    sourceAccountId!: Number;

    @BelongsTo(() => Account, 'source_account_id')
    sourceAccount!: Account;
}

export default Notification;