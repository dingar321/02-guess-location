import { Column, Entity, PrimaryGeneratedColumn, Timestamp } from "typeorm";

@Entity('password_resets')
export class Password {

    @PrimaryGeneratedColumn({ name: 'reset_id' })
    resetId: number;

    @Column({
        name: 'email',
        type: 'varchar',
        length: 255,
        nullable: false
    })
    email: string;

    @Column({
        name: 'reset_token',
        type: 'varchar',
        length: 255,
        nullable: false,
        unique: true
    })
    resetToken: string;

}