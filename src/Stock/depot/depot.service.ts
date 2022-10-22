import { Injectable, NotFoundException } from '@nestjs/common';
import { Depot } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDepotDto } from './dto/create-depot.dto';
import { UpdateDepotDto } from './dto/update-depot.dto';

@Injectable()
export class DepotService {
  constructor(private prisma: PrismaService) {}

  async create(createDepotDto: CreateDepotDto) {
    const depot = await this.prisma.depot.create({
      data: {
        ...createDepotDto,
      },
    });
    console.log(createDepotDto);
    return { msg: 'Vous avez crée un dépot' };
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

    //counting the number of depots that will be extracted after filtering our table
    const count = await this.prisma.depot.count({ where: { ...filter } });

    //preparing the pagination object
    if (page && limit) {
      skip = (page - 1) * limit;
      numOfPages = Math.ceil(count / limit);
      pagination = { take: +limit, skip };
    }

    //quey the database to get depots filterde and paginated if ther are filter and pagination demanded
    const depots = await this.prisma.depot.findMany({
      where: filter,
      ...pagination,
      orderBy: sort,
    });

    //return a json object that contains depots and their total number and also the number of pages
    return { depots, totalDepots: count, numOfPages };
  }

  //find a depot by id
  async findOne(id: number) {
    const depot = await this.prisma.depot.findUnique({ where: { id } });
    this.verifyExistance(depot);
    return depot;
  }

  //update a depot
  async update(id: number, updateDepotDto: UpdateDepotDto) {

    const exist = await this.prisma.depot.findUnique({ where: { id } });
    this.verifyExistance(exist);
    
    const depot = await this.prisma.depot.update({
      where: { id },
      data: updateDepotDto,
    });

    return { msg: 'Vous avez modifié une depoté', depot };
  }

  async remove(ids: number[]) {
    let deleted: number = 0;
    let msg: string[] = [];

    for (let i: number = 0; i < ids.length; i++) {
      const depot = await this.prisma.depot.findUnique({ where: { id: ids[i] } });
      try {
        if (depot) {
          await this.prisma.depot.delete({ where: { id: ids[i] } });
          msg.push(`Vous avez supprimé le dépot ${depot.name} | `);
          deleted = deleted + 1;
        } else {
          msg.push(`Dépot avec Id ${ids[i]} n'existe pas | `);
        }
      } catch (error) {
        if (error.code === 'P2003') {
          msg.push(`le depot ${depot.name} ne peut pas étre supprimé | `);
        }
      }
    }
    console.log(deleted);
    msg.push(`TOTAL SUPPRESSIONS: ${deleted} DEPOT${deleted > 1 ? 's' : ''}`);
    return { msg: [msg] };
  }

  //toggle block depot
  async toggleBlock(id: number) {
    const depot = await this.prisma.depot.findUnique({ where: { id } });
    this.verifyExistance(depot);
    const isBlocked = depot.isBlocked;
    await this.prisma.depot.update({
      where: { id },
      data: { isBlocked: !isBlocked },
    });
    const msg = `Vous avez ${isBlocked ? 'dé' : ''}bloqué le depot ${
      depot.name
    }`;
    return { msg };
  }

  //toggle lock depot
  async toggleLock(id: number) {
    const depot = await this.prisma.depot.findUnique({ where: { id } });
    this.verifyExistance(depot);
    const isLocked = depot.isLocked;
    await this.prisma.depot.update({
      where: { id },
      data: { isLocked: !isLocked },
    });
    const msg = `Vous avez ${isLocked ? 'dé' : ''}verouillé le dépot ${
      depot.name
    }`;
    return { msg };
  }


  verifyExistance(depot: Depot) {
    if (depot) {
      return;
    }
    throw new NotFoundException("Ce Dépot n'existe pas !");
  }
}
