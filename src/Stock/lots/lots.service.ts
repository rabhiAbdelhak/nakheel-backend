import { Injectable, NotFoundException } from '@nestjs/common';
import { Lot } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLotDto } from './dto/create-lot.dto';
import { UpdateLotDto } from './dto/update-lot.dto';

@Injectable()
export class LotsService {
  constructor(private prisma: PrismaService) {}

  async create(createLotDto: CreateLotDto , creatorId : number) {
    const lot = await this.prisma.lot.create({
      data: {
        ...createLotDto,
        creatorId,
        updaterId: creatorId
      },
    });
    console.log(createLotDto);
    return { msg: 'Vous avez crée un lot' };
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

    //counting the number of lots that will be extracted after filtering our table
    const count = await this.prisma.lot.count({ where: { ...filter } });

    //preparing the pagination object
    if (page && limit) {
      skip = (page - 1) * limit;
      numOfPages = Math.ceil(count / limit);
      pagination = { take: +limit, skip };
    }

    //quey the database to get lots filterde and paginated if ther are filter and pagination demanded
    const lots = await this.prisma.lot.findMany({
      where: filter,
      ...pagination,
      orderBy: sort,
      include: {
        product: {
          select: {
            designation: true
          }
        }
      }
    });

    //return a json object that contains lots and their total number and also the number of pages
    return { lots, totalLots: count, numOfPages };
  }

  //find a lot by id
  async findOne(id: number) {
    const lot = await this.prisma.lot.findUnique({ where: { id } });
    this.verifyExistance(lot);
    return lot;
  }

  //update a lot
  async update(id: number, updateLotDto: UpdateLotDto, updaterId: number) {

    const exist = await this.prisma.lot.findUnique({ where: { id } });
    this.verifyExistance(exist);
    
    const lot = await this.prisma.lot.update({
      where: { id },
      data: {...updateLotDto, updaterId},
    });

    return { msg: 'Vous avez modifié un lot', lot };
  }

  async remove(ids: number[]) {
    let deleted: number = 0;
    let msg: string[] = [];

    for (let i: number = 0; i < ids.length; i++) {
      const lot = await this.prisma.lot.findUnique({ where: { id: ids[i] } });
      try {
        if (lot) {
          await this.prisma.lot.delete({ where: { id: ids[i] } });
          msg.push(`Vous avez supprimé le lot ${lot.number} | `);
          deleted = deleted + 1;
        } else {
          msg.push(`Produit avec Id ${ids[i]} n'existe pas | `);
        }
      } catch (error) {
        if (error.code === 'P2003') {
          msg.push(`le lot ${lot.number} ne peut pas étre supprimé | `);
        }
      }
    }
    console.log(deleted);
    msg.push(`TOTAL SUPPRESSIONS: ${deleted} PRODUIT${deleted > 1 ? 's' : ''}`);
    return { msg: [msg] };
  }

  //toggle block lot
  async toggleBlock(id: number) {
    const lot = await this.prisma.lot.findUnique({ where: { id } });
    this.verifyExistance(lot);
    const isBlocked = lot.isBlocked;
    await this.prisma.lot.update({
      where: { id },
      data: { isBlocked: !isBlocked },
    });
    const msg = `Vous avez ${isBlocked ? 'dé' : ''}bloqué le lot ${
      lot.number
    }`;
    return { msg };
  }

  //toggle lock lot
  async toggleLock(id: number) {
    const lot = await this.prisma.lot.findUnique({ where: { id } });
    this.verifyExistance(lot);
    const isLocked = lot.isLocked;
    await this.prisma.lot.update({
      where: { id },
      data: { isLocked: !isLocked },
    });
    const msg = `Vous avez ${isLocked ? 'dé' : ''}verouillé le lot ${
      lot.number
    }`;
    return { msg };
  }


  verifyExistance(lot: Lot) {
    if (lot) {
      return;
    }
    throw new NotFoundException("Ce Lot n'existe pas !");
  }
}
