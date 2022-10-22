import { IsNotEmpty, IsNumber } from "class-validator"


export class CreateProductDto {
    @IsNotEmpty({message: '$property|Vous devez fournir une description'})
    designation: string
    @IsNotEmpty({message: '$property|Vous devez fournir une reférence'})
    reference: string
    maxPrice: number
    @IsNotEmpty({message: '$property|Vous devez fournir le prix minimal'})
    minPrice: number
    @IsNotEmpty({message: '$property|Vous devez choisir une category'})
    categoryId: number
    unitId: number
    creatorId?: number
    updaterId?: number
}
