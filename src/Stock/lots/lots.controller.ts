import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { LotsService } from './lots.service';
import { CreateLotDto } from './dto/create-lot.dto';
import { UpdateLotDto } from './dto/update-lot.dto';

@Controller('stock/lots')
export class LotsController {
  constructor(private readonly lotsService: LotsService) {}

  @Post()
  create(@Body() createLotDto: CreateLotDto, @Req() req) {
    const creatorId = req?.user.id
    return this.lotsService.create(createLotDto, creatorId);
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
    return this.lotsService.findAll(filter, limit, page, sortValue);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lotsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLotDto: UpdateLotDto, @Req() req) {
    const updaterId = req?.user.id
    return this.lotsService.update(+id, updateLotDto, updaterId);
  }

  @Delete()
  remove(@Body('ids') ids: number[]) {
    return this.lotsService.remove(ids);
  }
}
