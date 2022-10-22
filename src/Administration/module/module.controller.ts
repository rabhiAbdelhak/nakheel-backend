import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('Module')
@Controller('admin/modules')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post()
  create(@Body() createModuleDto: CreateModuleDto) {
    return this.moduleService.create(createModuleDto);
  }

  @Get()
  findAll() {
    return this.moduleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moduleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto) {
    return this.moduleService.update(+id, updateModuleDto);
  }

  @Delete()
  remove(@Body('ids') ids: number[]) {
    return this.moduleService.remove(ids);
  }
  @Patch(':id/options')
  addOptionToModel(@Param('id') moduleId: number, @Body('optionId') optionId: number){
    return this.moduleService.addOptionToModel(+moduleId, optionId);
  }
  @Get(':id/options')
  getModuleOptions(@Param('id') moduleId: number){
    return this.moduleService.getModuleOptions(+moduleId);
  }
}
