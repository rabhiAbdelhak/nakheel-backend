import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}
  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.prisma.category.create({
      data: {
        ...createCategoryDto,
      },
    });
    return { msg: 'Vous avez crée une categorie' };
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

    //counting the number of categorys that will be extracted after filtering our table
    const count = await this.prisma.category.count({ where: { ...filter } });

    //preparing the pagination object
    if (page && limit) {
      skip = (page - 1) * limit;
      numOfPages = Math.ceil(count / limit);
      pagination = { take: +limit, skip };
    }

    //quey the database to get categorys filterde and paginated if ther are filter and pagination demanded
    const categories = await this.prisma.category.findMany({
      where: filter,
      ...pagination,
      orderBy: sort,
    });

    //return a json object that contains categorys and their total number and also the number of pages
    return { categories, totalCategories: count, numOfPages };
  }

  //find a category by id
  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    this.verifyExistance(category);
    return category;
  }

  //update a category
  async update(id: number, updateCategoryDto: UpdateCategoryDto) {

    const exist = await this.prisma.category.findUnique({ where: { id } });
    this.verifyExistance(exist);
    
    const category = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });

    return { msg: 'Vous avez modifié une categorie', category };
  }

  async remove(ids: number[]) {
    let deleted: number = 0;
    let msg: string[] = [];

    for (let i: number = 0; i < ids.length; i++) {
      const category = await this.prisma.category.findUnique({ where: { id: ids[i] } });
      try {
        if (category) {
          await this.prisma.category.delete({ where: { id: ids[i] } });
          msg.push(`Vous avez supprimé la categorie ${category.name} | `);
          deleted = deleted + 1;
        } else {
          msg.push(`Categorie avec Id ${ids[i]} n'existe pas | `);
        }
      } catch (error) {
        if (error.code === 'P2003') {
          msg.push(`la categorie ${category.name} ne peut pas étre supprimé | `);
        }
      }
    }
    console.log(deleted);
    msg.push(`TOTAL SUPPRESSIONS: ${deleted} CATEGORIE${deleted > 1 ? 's' : ''}`);
    return { msg: [msg] };
  }

  //toggle block category
  async toggleBlock(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    this.verifyExistance(category);
    const isBlocked = category.isBlocked;
    await this.prisma.category.update({
      where: { id },
      data: { isBlocked: !isBlocked },
    });
    const msg = `Vous avez ${isBlocked ? 'dé' : ''}bloqué le category ${
      category.name
    }`;
    return { msg };
  }

  //toggle lock category
  async toggleLock(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    this.verifyExistance(category);
    const isLocked = category.isLocked;
    await this.prisma.category.update({
      where: { id },
      data: { isLocked: !isLocked },
    });
    const msg = `Vous avez ${isLocked ? 'dé' : ''}verouillé le category ${
      category.name
    }`;
    return { msg };
  }
 
  

  deletePermissionFromCategory() {
    return 'delete permission from category';
  }

  verifyExistance(category: Category) {
    if (category) {
      return;
    }
    throw new NotFoundException("Cet Categorie n'existe pas !");
  }
}
