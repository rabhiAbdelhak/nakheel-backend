import { PartialType } from '@nestjs/swagger';
import { CreateDepotDto } from './create-depot.dto';

export class UpdateDepotDto extends PartialType(CreateDepotDto) {}
