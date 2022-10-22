import {ApiProperty} from '@nestjs/swagger';

export class CreatePermissionDto {
    @ApiProperty()
    name: string
    @ApiProperty()
    identifier: string
    @ApiProperty()
    order: number
    @ApiProperty()
    optionId: number
}
