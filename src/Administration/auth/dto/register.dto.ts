import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, MinLength } from "class-validator"
import {ApiProperty} from '@nestjs/swagger';

export class RegisterDto{
    @ApiProperty()
    @IsNotEmpty()
    @ApiProperty()
    firstname? : string
    @ApiProperty()
    @IsNotEmpty()
    lastname?: string
    @ApiProperty()
    @MinLength(5, {
        message: '$property|Le nom d\'utilisateur doit étre 5 caractères ou plus !'
    })
    username: string
    @ApiProperty()
    @IsEmail({}, {message: '$property|Entrez un email valid'})
    email?: string
    @ApiProperty()
    @IsOptional()
    phone? : string
    @ApiProperty()
    isAdmin?: boolean
    @ApiProperty()
    @MinLength(5, {
      message: "$property|le mot de passe doit ètres plus de 5 caractères !"
    })
    password: string
}