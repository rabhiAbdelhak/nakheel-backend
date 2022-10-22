import { IsNotEmpty, MinLength } from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class UpdatePsswordDto {
  @ApiProperty()
  @IsNotEmpty({
    message: 'Entrer un nouveau mot de passe',
  })
  @MinLength(5, {
    message: 'Le mot de passe doit ètre plus de 5 caractères',
  })
  password: string;
  @ApiProperty()
  @IsNotEmpty({
    message: 'Valider le mot de passe',
  })
  confirm: string;
}
