import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService){}

  async create(createPermissionDto: CreatePermissionDto[]) {
    const {count} = await this.prisma.permission.createMany({data: createPermissionDto});
    return {msg: 'Vous avez ajouté '+count+' permissions !'};
  }

  async findAll() {
    const permissions = await this.prisma.permission.findMany();
    return permissions;
  }

  async findOne(id: number) {
    const permission = await this.prisma.permission.findUnique({where: {id}})
    this.verifyExistance(permission);
    return permission;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    const exist = await this.prisma.permission.findUnique({where: {id}});
    this.verifyExistance(exist);
    const permission = await this.prisma.permission.update({where: {id}, data: {...updatePermissionDto}});
    return {msg: 'Vous avez modifié une permission', permission};
  }

  async remove(ids: number[]) {
    const {count} = await this.prisma.permission.deleteMany({where: {id: {in: ids}}});
    const msg = count > 0 ? `Vous avez supprimé ${count} permission${count > 1 ? 's' : ''}` : 'Vous n\'avez supprimé aucun permission';
    return {msg};
  }
  verifyExistance(permission){
    if(permission){
      return
    }
    throw new NotFoundException('Cette permission n\'existe pas');
  }
}
