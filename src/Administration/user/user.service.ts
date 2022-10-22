import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdatePsswordDto } from './dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as argon from 'argon2';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
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
   const count = await this.prisma.user.count({ where: { ...filter } });

   //preparing the pagination object
   if (page && limit) {
     skip = (page - 1) * limit;
     numOfPages = Math.ceil(count / limit);
     pagination = { take: +limit, skip };
   }

   //quey the database to get roles filterde and paginated if ther are filter and pagination demanded
   const users = await this.prisma.user.findMany({
     where: filter,
     ...pagination,
     orderBy: sort,
   });
   console.warn(filter);

   //return a json object that contains roles and their total number and also the number of pages
   return { users, totalUsers: count, numOfPages };
  }

  //find a user by id
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    this.verifyExistance(user);
    return user;
  }

  //update a user
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
    this.verifyExistance(user);
    return user;
  }

  async remove(ids: number[]) {
    let deleted: number = 0
    let msg : string = '';     
    
    for(let i : number = 0 ; i < ids.length ; i++){
      const user = await  this.prisma.user.findUnique({where: {id: ids[i]}});
      try{
        if(user){
          await this.prisma.user.delete({where: {id: ids[i]}});
          msg += `Vous avez supprimé l'utilisateur ${user.username} | `;
          deleted = deleted+1;
        }else{
          msg += `Utilisateur avec Id ${ids[i]} n'existe pas | `
        }
      }catch(error){
        if(error.code === 'P2003'){
          msg += `L'utilisateur ${user.username} ne peut pas étre supprimé | `
        }
      }
    }
    console.log(deleted)
    msg += `TOTAL SUPPRESSIONS: ${deleted} UTILISATEUR${deleted> 1 ? 'S': ''}`
    return {msg};
  }

  //toggle block user
  async toggleBlock(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    this.verifyExistance(user);
    const isBlocked = user.isBlocked;
    await this.prisma.user.update({
      where: { id },
      data: { isBlocked: !isBlocked },
    });
    const msg = `Vous avez ${isBlocked ? 'dé' : ''}bloqué un utilisateur`;
    return { msg };
  }

  //toggle lock user
  async toggleLock(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    this.verifyExistance(user);
    const isLocked = user.isLocked;
    await this.prisma.user.update({
      where: { id },
      data: { isLocked: !isLocked },
    });
    const msg = `Vous avez ${isLocked ? 'dé' : ''}veroullé un utilisateur`;
    return { msg };
  }
  async updatePassword(id: number, updatePsswordDto: UpdatePsswordDto) {
    //distruct the body
    let { password, confirm } = updatePsswordDto;
    if (password !== confirm) {
      throw new BadRequestException('Les mots de passe ne sont pas identiques');
    }
    //find the user we want to change his password
    const user = await this.prisma.user.findUnique({ where: { id } });
    this.verifyExistance(user);
    password = await argon.hash(password);
    await this.prisma.user.update({ where: { id }, data: { password } });
    return {
      msg: `Vous avez modifier le mot de passe de l'utilisateur: ${user.firstname} ${user.lastname}`,
    };
  }

  async getCurrentuser(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id: id } });
    delete user['password'];
    return user;
  }

  async getUserRoles(userid: number) {
    const user_roles = await this.prisma.user.findFirst({
      where: { id: userid },
      include: {
        RolesOnUser: {
          select: {
            role: {
              select: {
                id: true,
                role_name: true,
                PermissionsOnRole: {
                  select: {
                    permission: {
                      select: {
                        id: true,
                        name: true,
                        order: true,
                        identifier: true,
                        option: {
                          select: {
                            id: true,
                            name: true,
                          }
                        }
                      }
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    const { id, firstname, lastname, RolesOnUser } = user_roles;
    const userWithroles = {
      id,
      firstname,
      lastname,
      roles: RolesOnUser.map((role) => role.role),
    };
    const usersWithRoleAndPermissions = {
      ...userWithroles,
      roles: userWithroles.roles.map((role) => ({
        id: role.id,
        role_name: role.role_name,
        permissions: role.PermissionsOnRole.map((per) => per.permission),
      })),
    };
    delete usersWithRoleAndPermissions.roles['PermissionsOnRole']
    return usersWithRoleAndPermissions;
  }

  async getUserPermissions(userId: number){
    const usersWithRoleAndPermissions = await this.getUserRoles(userId);
    let permissions = usersWithRoleAndPermissions.roles.map(role => role.permissions).flat(1).map(per => per.identifier);
    permissions = [...new Set(permissions)];
    return permissions
  } 
  async addRoleToUser(userId: number, roleId: number) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(
        "Le role que vous voulez ajouter à cet user n'existe pas!",
      );
    }
    const existedRole = await this.prisma.rolesOnUser.findFirst({
      where: { roleId, userId },
    });
    if (existedRole) {
      throw new BadRequestException(
        'ce role a été déja attaché à cet utilisateur ! vous ne pouvez pas la faire deux fois',
      );
    }
    const role_user = await this.prisma.rolesOnUser.create({
      data: { userId, roleId },
    });

    return { msg: 'Le role a été attaché à cet utilisateur !' };
  }

  async deleteRoleFromUser(userId: number, roleId: number) {
    console.log(roleId);
    const role_user = await this.prisma.rolesOnUser.findFirst({
      where: { userId, roleId },
    });
    if (!role_user) {
      throw new NotFoundException(
        "Le role que vous voulez enlever n'existe pas !",
      );
    }
    await this.prisma.rolesOnUser.delete({ where: { id: role_user.id } });

    return { msg: 'Vous Avez enlevé un role !' };
  }

  verifyExistance(user: User) {
    if (user) {
      return;
    }
    throw new NotFoundException("Cet utilisateur n'existe pas !");
  }
}
