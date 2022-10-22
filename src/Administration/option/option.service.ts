import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOptionDto } from './dto/create-option.dto';
import { UpdateOptionDto } from './dto/update-option.dto';

@Injectable()
export class OptionService {
  constructor(private prisma: PrismaService){}

  async create(createOptionDto: CreateOptionDto[]) {
    const {count} = await this.prisma.option.createMany({data: createOptionDto});
    return {msg: 'Vous avez ajouté '+count+' options !'};
  }

  async findAll() {
    const options = await this.prisma.option.findMany();
    return options;
  }

  async findOne(id: number) {
    const option = await this.prisma.option.findUnique({where: {id}})
    this.verifyExistance(option);
    return option;
  }

  async update(id: number, updateOptionDto: UpdateOptionDto) {
    const exist = await this.prisma.option.findUnique({where: {id}});
    this.verifyExistance(exist);
    const option = await this.prisma.option.update({where: {id}, data: {...updateOptionDto}});
    return {msg: 'Vous avez modifié une option', option};
  }

  async remove(ids: number[]) {
    const {count} = await this.prisma.option.deleteMany({where: {id: {in: ids}}});
    const msg = count > 0 ? `Vous avez supprimé ${count} option${count > 1 ? 's' : ''}` : 'Vous n\'avez supprimé aucun option';
    return {msg};
  }
  verifyExistance(option){
    if(option){
      return
    }
    throw new NotFoundException('Cette option n\'existe pas');
  }
}
