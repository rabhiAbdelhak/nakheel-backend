import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}
  async create(createRoleDto: CreateRoleDto) {
    const role = await this.prisma.role.create({
      data: {
        ...createRoleDto,
      },
    });
    return { msg: 'Vous avez crée un role' };
  }

  async findAll(filter: any, limit: number, page: number, sort: {[key: string] : 'asc' | 'desc'}) {
    //initialize all the necessary variables in our method
    let numOfPages: number = 1;
    let skip: number = 0;
    let pagination: { skip?: number; take?: number } = { skip };

    //reducing the filter array to make it as an object that respect the typing in the where clause
    //filter comes as an array [{..}, {...}] each object represent a conditoin in the were clause
    filter = filter.reduce((accu, item) => ({ ...accu, ...item }), {});

    //verify if there are attributes of type date in the filter and tranform their content to for Date
    if ('createdAt' in filter) {
      filter.createdAt = {
        lte: new Date(filter.createdAt.lte),
        gte: new Date(filter.createdAt.gte),
      };
    }
    if ('updatedAt' in filter) {
      filter.updatedAt = {
        lte: new Date(filter.updatedAt.lte),
        gte: new Date(filter.updatedAt.gte),
      };
    }

    //counting the number of roles that will be extracted after filtering our table
    const count = await this.prisma.role.count({ where: { ...filter } });

    //preparing the pagination object
    if (page && limit) {
      skip = (page - 1) * limit;
      numOfPages = Math.ceil(count / limit);
      pagination = { take: +limit, skip };
    }

    //quey the database to get roles filterde and paginated if ther are filter and pagination demanded
    const roles = await this.prisma.role.findMany({
      where: filter,
      ...pagination,
      orderBy: sort,
    });
    console.warn(filter);

    //return a json object that contains roles and their total number and also the number of pages
    return { roles, totalRoles: count, numOfPages };
  }

  //find a role by id
  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    this.verifyExistance(role);
    return role;
  }

  //update a role
  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const exist = await this.prisma.role.findUnique({ where: { id } });
    this.verifyExistance(exist);
    const role = await this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });

    return { msg: 'Vous avez modifié un role', role };
  }

  async remove(ids: number[]) {
    let deleted: number = 0;
    let msg: string[] = [];

    for (let i: number = 0; i < ids.length; i++) {
      const role = await this.prisma.role.findUnique({ where: { id: ids[i] } });
      try {
        if (role) {
          await this.prisma.role.delete({ where: { id: ids[i] } });
          msg.push(`Vous avez supprimé le role ${role.role_name} | `);
          deleted = deleted + 1;
        } else {
          msg.push(`Role avec Id ${ids[i]} n'existe pas | `);
        }
      } catch (error) {
        if (error.code === 'P2003') {
          msg.push(`le role ${role.role_name} ne peut pas étre supprimé | `);
        }
      }
    }
    console.log(deleted);
    msg.push(`TOTAL SUPPRESSIONS: ${deleted} ROLE${deleted > 1 ? 's' : ''}`);
    return { msg: [msg] };
  }

  //toggle block role
  async toggleBlock(id: number) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    this.verifyExistance(role);
    const isBlocked = role.isBlocked;
    await this.prisma.role.update({
      where: { id },
      data: { isBlocked: !isBlocked },
    });
    const msg = `Vous avez ${isBlocked ? 'dé' : ''}bloqué le role ${
      role.role_name
    }`;
    return { msg };
  }

  //toggle lock role
  async toggleLock(id: number) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    this.verifyExistance(role);
    const isLocked = role.isLocked;
    await this.prisma.role.update({
      where: { id },
      data: { isLocked: !isLocked },
    });
    const msg = `Vous avez ${isLocked ? 'dé' : ''}verouillé le role ${
      role.role_name
    }`;
    return { msg };
  }

  async getRolePermissions(roleId: number) {
    const role_permissions = await this.prisma.role.findFirst({
      where: { id: roleId },
      include: {
        PermissionsOnRole: {
          select: {
            permission: {
              select: {
                id: true,
                name: true,
                identifier: true,
                order: true,
                option: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    this.verifyExistance(role_permissions);
    const { id, role_name, PermissionsOnRole } = role_permissions;
    const rolePermissions = {
      id,
      role_name,
      permissions: PermissionsOnRole.map((per) => per.permission),
    };
    return rolePermissions;
  }

  async addPermissionToRole(
    roleId: number,
    body: { optionId: number; permissions?: number[]; permissionId?: number },
  ) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    const { permissionId, permissions, optionId } = body;
    this.verifyExistance(role);
    let msg = '';
    if (permissionId) {
      const permission_role = await this.prisma.permissionsOnRole.findFirst({
        where: { roleId, permissionId },
      });
      if (permission_role) {
        await this.prisma.permissionsOnRole.delete({
          where: { id: permission_role.id },
        });
        msg = 'Permission enlevée';
      } else {
        await this.prisma.permissionsOnRole.create({
          data: { roleId, permissionId },
        });
        msg = 'Permission attachée';
      }
    }
    if (permissions) {
      const optionPermissions = await this.prisma.permission.findMany({
        where: { optionId },
      });
      const perIds = optionPermissions.map((per) => per.id);
      if (permissions.length > 0) {
        for (let i = 0; i < perIds.length; i++) {
          const permissionExist = await this.prisma.permissionsOnRole.findFirst(
            { where: { permissionId: perIds[i], roleId } },
          );
          if (!permissionExist) {
            await this.prisma.permissionsOnRole.create({
              data: { roleId, permissionId: perIds[i] },
            });
          }
        }
      } else {
        await this.prisma.permissionsOnRole.deleteMany({
          where: {
            roleId,
            permission: {
              optionId,
            },
          },
        });
      }
    }

    return { msg };
  }

  deletePermissionFromRole() {
    return 'delete permission from role';
  }

  async getRolePermissionsByOption(roleId: number, optionId: number) {
    const role_permissions = await this.prisma.role.findFirst({
      where: { id: roleId },
      include: {
        PermissionsOnRole: {
          where: {
            permission: {
              optionId,
            },
          },
          select: {
            permission: {
              select: {
                id: true,
                name: true,
                identifier: true,
                order: true,
                option: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    this.verifyExistance(role_permissions);
    const { id, role_name, PermissionsOnRole } = role_permissions;
    const rolePermissions = {
      id,
      role_name,
      permissions: PermissionsOnRole.map((per) => per.permission),
    };
    return rolePermissions;
  }

  verifyExistance(role: Role) {
    if (role) {
      return;
    }
    throw new NotFoundException("Ce role n'existe pas !");
  }
}
