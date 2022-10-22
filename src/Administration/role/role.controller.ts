import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import {ApiTags} from '@nestjs/swagger';
import { Role } from '@prisma/client';

@ApiTags('Role')
@Controller('admin/roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
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
    return this.roleService.findAll(filter, limit, page, sortValue);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }

  @Delete()
  remove(@Body('ids') ids: number[]) {
    return this.roleService.remove(ids);
  }

  @Patch(':id/block')
  toggleBlock(@Param('id') roleId: string){
    return this.roleService.toggleBlock(+roleId);
  }
  @Patch(':id/lock')
  toggleLock(@Param('id') roleId: string){
    return this.roleService.toggleLock(+roleId);
  }

  @Get(':id/permissions')
  getRolePermissions(@Param('id') roleId: string, @Query('optionId') optionId: string){
    if(optionId){
      return this.roleService.getRolePermissionsByOption(+roleId, +optionId)
    }
    return this.roleService.getRolePermissions(+roleId);
  }

  @Patch(':id/permissions')
  addPermissionsToRole(@Param('id') roleId: string, @Body() body: {optionId: number, permissions?: number[], permissionId: number}){
    return this.roleService.addPermissionToRole(+roleId, body);
  }

  @Delete(':id/permissions')
  deletePermissionsFromRole(){
    return this.roleService.deletePermissionFromRole();
  }

  
}
