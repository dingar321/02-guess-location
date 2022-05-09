import { Type } from 'class-transformer'
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDto {

    @IsOptional()
    @IsPositive()
    //The number of items to show 
    limit: number;


    @IsOptional()
    @IsPositive()
    //The number of items to  
    //skip before we start to show
    offset: number;
}