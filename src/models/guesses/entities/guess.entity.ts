import { Location } from "src/models/locations/entities/location.entity";
import { User } from "src/models/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Timestamp } from "typeorm";

@Entity('guesses')
export class Guess {

    @PrimaryGeneratedColumn({ name: 'guess_id' })
    guessId: number;

    //Latitude is written before longitude
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
        name: 'error_distance_km',
        type: 'decimal',
        nullable: false
    })
    errorDistanceKm: number;

    @Column({
        name: 'time_posted',
        type: 'timestamp',
        nullable: false,
    })
    timePosted: Timestamp;

    //user 1--m guess
    @ManyToOne(type => User, {
        nullable: false,
        cascade: true
    })
    @JoinColumn({
        name: 'user_tk'
    })
    userTk: User;

    //location 1--m guess
    @ManyToOne(type => Location, {
        nullable: false,
        cascade: true
    })
    @JoinColumn({
        name: 'location_tk'
    })
    locationTk: Location;

}