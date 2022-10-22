import {ApiProperty} from '@nestjs/swagger';

export class CreateModuleDto {
    @ApiProperty()
    title: string
    @ApiProperty()
    logo: string
    @ApiProperty()
    link: string
}
