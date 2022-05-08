import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/authentication/auth.module";
import { Guess } from "./entities/guess.entity";
import { GuessController } from "./guess.controller";
import { GuessService } from "./guess.service";
import { LocationModule } from 'src/models/locations/location.module'

@Module({
    imports: [
        TypeOrmModule.forFeature([Guess]),

        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1d' }
        }),

        //Imported modules
        LocationModule, AuthModule
    ],
    controllers: [GuessController],
    providers: [GuessService],
})
export class GuessModule { }