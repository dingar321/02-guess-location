import { User } from "src/models/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Timestamp } from "typeorm";

@Entity('locations')
export class Location {

    @PrimaryGeneratedColumn({ name: 'locations_id' })
    locationsId: number;

    @Column({
        name: 'location_name',
        type: 'varchar',
        length: 255,
        nullable: false
    })
    locationName: string;

    @Column({
        name: 'longitude',
        type: 'decimal',
        nullable: false
    })
    longitude: number;

    @Column({
        name: 'latitude',
        type: 'decimal',
        nullable: false
    })
    latitude: number;

    @Column({
        name: 'time_posted',
        type: 'timestamp',
        nullable: false,
    })
    timePosted: Timestamp;

    @Column({
        name: 's3_key',
        type: 'varchar',
        length: 255,
        nullable: false
    })
    s3key: string;

    @Column({
        name: 's3_data',
        type: 'jsonb',
        nullable: false
    })
    s3Data?: object;

    //user 1--m quote
    @ManyToOne(type => User, {
        nullable: false,
        cascade: true
    })
    @JoinColumn({
        name: 'user_tk'
    })
    userTk: User;
}