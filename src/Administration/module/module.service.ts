import { Injectable, NotFoundException, Options } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Injectable()
export class ModuleService {
  constructor(private prisma: PrismaService) {}

  async create(createModuleDto: CreateModuleDto) {
    const module = await this.prisma.module.create({ data: createModuleDto });
    return { msg: 'Vous avez ajouté un module !', module };
  }

  async findAll() {
    const modules = await this.prisma.module.findMany();
    return {modules};
  }

  async findOne(id: number) {
    const module = await this.prisma.module.findUnique({ where: { id } });
    this.verifyExistance(module);
    return module;
  }

  async update(id: number, updateModuleDto: UpdateModuleDto) {
    const exist = await this.prisma.module.findUnique({ where: { id } });
    this.verifyExistance(exist);
    const module = await this.prisma.module.update({
      where: { id },
      data: { ...updateModuleDto },
    });
    return { msg: 'Vous avez modifié un module', module };
  }

  async remove(ids: number[]) {
    const { count } = await this.prisma.module.deleteMany({
      where: { id: { in: ids } },
    });
    const msg =
      count > 0
        ? `Vous avez supprimé ${count} module${count > 1 ? 's' : ''}`
        : "Vous n'avez supprimé aucun module";
    return { msg };
  }

  async addOptionToModel(moduleId: number, optionId: number) {
    const optionModule = await this.prisma.optionsOnModule.create({
      data: { moduleId, optionId },
    });
    return { msg: 'Vous avez ajouté une option à un model' };
  }

  async getModuleOptions(moduleId: number) {
    const options = await this.prisma.module.findFirst({
      where: { id: moduleId },
      include: {
        OptionsOnModule: {
          select: {
             option : {
              select: {
                id: true,
                name: true,
                permissions: true
              },
             }            
          },
        },
      },
    });
    const {id,title,OptionsOnModule } = options;
    const op = {id, title , options : OptionsOnModule.map(op => op.option)}
    return  op
  }
  
  verifyExistance(module) {
    if (module) {
      return;
    }
    throw new NotFoundException("Ce module n'existe pas");
  }
}
