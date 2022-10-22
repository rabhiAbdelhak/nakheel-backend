import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OptionService } from './option.service';
import { CreateOptionDto } from './dto/create-option.dto';
import { UpdateOptionDto } from './dto/update-option.dto';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('Option')
@Controller('admin/options')
export class OptionController {
  constructor(private readonly optionService: OptionService) {}

  @Post()
  create(@Body('optionsData') createOptionDto: CreateOptionDto[]) {
    return this.optionService.create(createOptionDto);
  }

  @Get()
  findAll() {
    return this.optionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.optionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOptionDto: UpdateOptionDto) {
    return this.optionService.update(+id, updateOptionDto);
  }

  @Delete()
  remove(@Body('ids') ids: number[]) {
    return this.optionService.remove(ids);
  }

}
