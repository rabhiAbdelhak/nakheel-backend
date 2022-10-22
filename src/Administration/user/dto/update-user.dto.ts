import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Allow, IsEmail, IsNotEmpty, MinLength, minLength } from 'class-validator';
import { RegisterDto } from 'src/Administration/auth/dto';


export class UpdateUserDto extends PartialType(OmitType(RegisterDto, ['password'])){
    
}
