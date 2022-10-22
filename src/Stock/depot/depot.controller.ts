import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DepotService } from './depot.service';
import { CreateDepotDto } from './dto/create-depot.dto';
import { UpdateDepotDto } from './dto/update-depot.dto';

@Controller('stock/depots')
export class DepotController {
  constructor(private readonly depotService: DepotService) {}

  @Post()
  create(@Body() createDepotDto: CreateDepotDto) {
    return this.depotService.create(createDepotDto);
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
    return this.depotService.findAll(filter, limit, page, sortValue);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.depotService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDepotDto: UpdateDepotDto) {
    return this.depotService.update(+id, updateDepotDto);
  }

  @Delete()
  remove(@Body('ids') ids: number[]) {
    return this.depotService.remove(ids);
  }
  @Patch(':id/block')
  toggleBlock(@Param('id') depotId: string){
    return this.depotService.toggleBlock(+depotId);
  }
  @Patch(':id/lock')
  toggleLock(@Param('id') depotId: string){
    return this.depotService.toggleLock(+depotId);
  }
}
