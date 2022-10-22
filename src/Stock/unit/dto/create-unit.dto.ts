import {IsNotEmpty, MaxLength } from "class-validator";

export class CreateUnitDto {
    @IsNotEmpty({
        message: '$property|Vous devez fournir un Symbol'
    })
    Symbol: string
    @MaxLength(50, {message: '$property|Une description doit étre inférieur à 50 caractères'})
    description: string
    convertionCoefficient: number
}
