import { IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: '$property|Une Categorie doit avoir un nom ?' })
  name: string;
  description?: string;
  parentId?: number;
}
