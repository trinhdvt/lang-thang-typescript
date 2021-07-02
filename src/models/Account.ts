import {BelongsToMany, Column, DataType, DefaultScope, HasMany, Model, Scopes, Table} from "sequelize-typescript";
import Post from "./Post";
import BookmarkedPost from "./BookmarkedPost";
import {Comment, CommentLike} from "./Comment";
import Follow from "./FollowRelationship";
import Notification from "./Notification";

@DefaultScope(() => ({
    where: {
        enabled: true
    }
}))
@Scopes(() => ({
    "un-active": {
        where: {
            enabled: false
        }
    }
}))
@Table({
    tableName: "account"
})
class Account extends Model {

    @Column({
        primaryKey: true,
        autoIncrement: true
    })
    id!: number;

    @Column
    email!: string;

    @Column
    password!: string;

    @Column
    name!: string;

    @Column({
        type: DataType.ENUM("ROLE_USER", "ROLE_ADMIN"),
        defaultValue: "ROLE_USER"
    })
    role!: string;

    @Column({defaultValue: false})
    enabled?: Boolean;

    @Column
    registerToken?: string;

    @Column
    avatarLink?: string;

    @Column
    about?: string;

    @Column
    fbLink?: string;

    @Column
    instagramLink?: string;

    @HasMany(() => Post)
    posts?: Post[];

    @BelongsToMany(() => Post, () => BookmarkedPost)
    bookmarkedPost?: Post[];

    @HasMany(() => Comment)
    comments?: Comment[];

    @BelongsToMany(() => Comment, () => CommentLike)
    likedComments?: Comment[];

    @BelongsToMany(() => Account, () => Follow, 'following_account_id')
    followingMe?: Account[];

    @HasMany(() => Notification)
    notifications?: Notification[];
}

export default Account;