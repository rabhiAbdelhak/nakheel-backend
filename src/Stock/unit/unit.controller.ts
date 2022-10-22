import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Controller('stock/units')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post()
  create(@Body() createUnitDto: CreateUnitDto) {
    return this.unitService.create(createUnitDto);
  }

  @Get()
  findAll(@Query() query: {filters?: string, page: number, limit: number, sort: string}) {
    let {filters, limit, page, sort} = query;
    let filter = [];
    let sortValue: any = {createdAt: 'asc'}
    if(filters){
     filter  = JSON.parse(filters);
    }
    if(sort){
      sortValue = JSON.parse(sort);
    }
    return this.unitService.findAll(filter, limit, page, sortValue);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unitService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
    return this.unitService.update(+id, updateUnitDto);
  }

  @Delete()
  remove(@Body('ids') ids: number[]) {
    return this.unitService.remove(ids);
  }
  @Patch(':id/block')
  toggleBlock(@Param('id') roleId: string){
    return this.unitService.toggleBlock(+roleId);
  }
  @Patch(':id/lock')
  toggleLock(@Param('id') roleId: string){
    return this.unitService.toggleLock(+roleId);
  }
}
