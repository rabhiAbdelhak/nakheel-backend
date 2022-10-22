import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto , creatorId : number) {
    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        creatorId,
        updaterId: creatorId
      },
    });
    console.log(createProductDto);
    return { msg: 'Vous avez crée un produit' };
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

    //counting the number of products that will be extracted after filtering our table
    const count = await this.prisma.product.count({ where: { ...filter } });

    //preparing the pagination object
    if (page && limit) {
      skip = (page - 1) * limit;
      numOfPages = Math.ceil(count / limit);
      pagination = { take: +limit, skip };
    }

    //quey the database to get products filterde and paginated if ther are filter and pagination demanded
    const products = await this.prisma.product.findMany({
      where: filter,
      ...pagination,
      orderBy: sort,
    });

    //return a json object that contains products and their total number and also the number of pages
    return { products, totalProducts: count, numOfPages };
  }

  //find a product by id
  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    this.verifyExistance(product);
    return product;
  }

  //update a product
  async update(id: number, updateProductDto: UpdateProductDto, updaterId: number) {

    const exist = await this.prisma.product.findUnique({ where: { id } });
    this.verifyExistance(exist);
    
    const product = await this.prisma.product.update({
      where: { id },
      data: {...updateProductDto, updaterId},
    });

    return { msg: 'Vous avez modifié un produit', product };
  }

  async remove(ids: number[]) {
    let deleted: number = 0;
    let msg: string[] = [];

    for (let i: number = 0; i < ids.length; i++) {
      const product = await this.prisma.product.findUnique({ where: { id: ids[i] } });
      try {
        if (product) {
          await this.prisma.product.delete({ where: { id: ids[i] } });
          msg.push(`Vous avez supprimé le produit ${product.designation} | `);
          deleted = deleted + 1;
        } else {
          msg.push(`Produit avec Id ${ids[i]} n'existe pas | `);
        }
      } catch (error) {
        if (error.code === 'P2003') {
          msg.push(`le produit ${product.designation} ne peut pas étre supprimé | `);
        }
      }
    }
    console.log(deleted);
    msg.push(`TOTAL SUPPRESSIONS: ${deleted} PRODUIT${deleted > 1 ? 's' : ''}`);
    return { msg: [msg] };
  }

  //toggle block product
  async toggleBlock(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    this.verifyExistance(product);
    const isBlocked = product.isBlocked;
    await this.prisma.product.update({
      where: { id },
      data: { isBlocked: !isBlocked },
    });
    const msg = `Vous avez ${isBlocked ? 'dé' : ''}bloqué le produit ${
      product.designation
    }`;
    return { msg };
  }

  //toggle lock product
  async toggleLock(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    this.verifyExistance(product);
    const isLocked = product.isLocked;
    await this.prisma.product.update({
      where: { id },
      data: { isLocked: !isLocked },
    });
    const msg = `Vous avez ${isLocked ? 'dé' : ''}verouillé le produit ${
      product.designation
    }`;
    return { msg };
  }


  verifyExistance(product: Product) {
    if (product) {
      return;
    }
    throw new NotFoundException("Ce Produit n'existe pas !");
  }
}
