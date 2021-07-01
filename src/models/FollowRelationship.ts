import {Column, ForeignKey, Model, Table} from "sequelize-typescript";
import Account from "./Account";

@Table({
    tableName: "following_relationship"
})
class Follow extends Model {

    @ForeignKey(() => Account)
    @Column({
        primaryKey: true
    })
    accountId!: Number;

    @ForeignKey(() => Account)
    @Column({
        primaryKey: true
    })
    followingAccountId!: Number;

    @Column
    followingDate?: Date;
}

export default Follow;