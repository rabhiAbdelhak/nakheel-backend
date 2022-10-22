import { Injectable, NotFoundException } from '@nestjs/common';
import { Unit } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitService {
  constructor(private prisma: PrismaService) {}

  async create(createUnitDto: CreateUnitDto) {
    const unit = await this.prisma.unit.create({
      data: {
        ...createUnitDto,
      },
    });
    console.log(createUnitDto);
    return { msg: 'Vous avez crée une unité' };
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

    //counting the number of units that will be extracted after filtering our table
    const count = await this.prisma.unit.count({ where: { ...filter } });

    //preparing the pagination object
    if (page && limit) {
      skip = (page - 1) * limit;
      numOfPages = Math.ceil(count / limit);
      pagination = { take: +limit, skip };
    }

    //quey the database to get units filterde and paginated if ther are filter and pagination demanded
    const units = await this.prisma.unit.findMany({
      where: filter,
      ...pagination,
      orderBy: sort,
    });

    //return a json object that contains units and their total number and also the number of pages
    return { units, totalUnits: count, numOfPages };
  }

  //find a unit by id
  async findOne(id: number) {
    const unit = await this.prisma.unit.findUnique({ where: { id } });
    this.verifyExistance(unit);
    return unit;
  }

  //update a unit
  async update(id: number, updateUnitDto: UpdateUnitDto) {

    const exist = await this.prisma.unit.findUnique({ where: { id } });
    this.verifyExistance(exist);
    
    const unit = await this.prisma.unit.update({
      where: { id },
      data: updateUnitDto,
    });

    return { msg: 'Vous avez modifié une unité', unit };
  }

  async remove(ids: number[]) {
    let deleted: number = 0;
    let msg: string[] = [];

    for (let i: number = 0; i < ids.length; i++) {
      const unit = await this.prisma.unit.findUnique({ where: { id: ids[i] } });
      try {
        if (unit) {
          await this.prisma.unit.delete({ where: { id: ids[i] } });
          msg.push(`Vous avez supprimé l'unité ${unit.Symbol} | `);
          deleted = deleted + 1;
        } else {
          msg.push(`Unité avec Id ${ids[i]} n'existe pas | `);
        }
      } catch (error) {
        if (error.code === 'P2003') {
          msg.push(`l'unité ${unit.Symbol} ne peut pas étre supprimé | `);
        }
      }
    }
    console.log(deleted);
    msg.push(`TOTAL SUPPRESSIONS: ${deleted} UNITE${deleted > 1 ? 's' : ''}`);
    return { msg: [msg] };
  }

  //toggle block unit
  async toggleBlock(id: number) {
    const unit = await this.prisma.unit.findUnique({ where: { id } });
    this.verifyExistance(unit);
    const isBlocked = unit.isBlocked;
    await this.prisma.unit.update({
      where: { id },
      data: { isBlocked: !isBlocked },
    });
    const msg = `Vous avez ${isBlocked ? 'dé' : ''}bloqué l'unité ${
      unit.Symbol
    }`;
    return { msg };
  }

  //toggle lock unit
  async toggleLock(id: number) {
    const unit = await this.prisma.unit.findUnique({ where: { id } });
    this.verifyExistance(unit);
    const isLocked = unit.isLocked;
    await this.prisma.unit.update({
      where: { id },
      data: { isLocked: !isLocked },
    });
    const msg = `Vous avez ${isLocked ? 'dé' : ''}verouillé l'unité ${
      unit.Symbol
    }`;
    return { msg };
  }


  verifyExistance(unit: Unit) {
    if (unit) {
      return;
    }
    throw new NotFoundException("Cet Unité de mesure n'existe pas !");
  }
}
