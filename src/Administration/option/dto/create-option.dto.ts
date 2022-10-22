import {ApiProperty} from '@nestjs/swagger';

export class CreateOptionDto {
    @ApiProperty()
    name: string
    @ApiProperty()
    description?: string
}
