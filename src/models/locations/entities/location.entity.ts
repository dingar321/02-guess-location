import { User } from "src/models/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Timestamp } from "typeorm";

@Entity('locations')
export class Location {

    @PrimaryGeneratedColumn({ name: 'location_id' })
    locationId: number;

    @Column({
        name: 'location_name',
        type: 'varchar',
        length: 255,
        nullable: false
    })
    locationName: string;

    @Column({
        name: 'latitude',
        type: 'decimal',
        nullable: false
    })
    latitude: number;

    @Column({
        name: 'longitude',
        type: 'decimal',
        nullable: false
    })
    longitude: number;


    @Column({
        name: 'time_posted',
        type: 'timestamp',
        nullable: false,
    })
    timePosted: Timestamp;

    @Column({
        name: 's3_image_key',
        type: 'varchar',
        length: 255,
        nullable: false
    })
    s3Imagekey: string;

    //user 1--m location
    @ManyToOne(type => User, {
        nullable: false,
        cascade: true
    })
    @JoinColumn({
        name: 'user_tk'
    })
    userTk: User;
}