import { MaxLength, MinLength } from "class-validator"
import {ApiProperty} from '@nestjs/swagger';

export class CreateRoleDto {
    @ApiProperty()
    @MinLength(4, {
        message: '$property|le nom de role doit ètre plus de 4 caractères'
    })
    role_name: string
    @ApiProperty()
    @MaxLength(50, {
        message: '$property|La note du role doit ètre moins de 50 caractères'
    })
    note?: string
}
