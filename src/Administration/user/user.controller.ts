import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePsswordDto } from './dto';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('User')
@Controller('admin/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  
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
    return this.userService.findAll(filter, limit, page, sortValue);
  }

  @Get('current')
  getCurrentUser(@Req() req){
    return this.userService.getCurrentuser(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete()
  remove(@Body('ids') ids: number[]) {
    return this.userService.remove(ids);
  }


  @Patch(':id/block')
  toggleBlock(@Param('id') id: string) {
    return this.userService.toggleBlock(+id);
  }

  @Patch(':id/lock')
  toggleLock(@Param('id') id: string) {
    return this.userService.toggleLock(+id);
  }

  @Patch(':id/password')
  updatepassword(@Param('id') id: string, @Body() updatePasswordDto: UpdatePsswordDto) {
    return this.userService.updatePassword(+id, updatePasswordDto);
  }

  @Get(':id/roles')
  getUserRoles(@Param('id') id: string){
    return this.userService.getUserRoles(+id)
  }
  @Patch(':id/roles')
  addRoleToUser(@Param('id') userId: string , @Body('roleId') roleId: number){
    return this.userService.addRoleToUser(+userId, roleId);
  }

  @Delete(':id/roles')
  deleteRoleFromUser(@Param('id') userId: string , @Body('roleId') roleId: number){
    return this.userService.deleteRoleFromUser(+userId, roleId)
  }
 
  @Get(':id/permissions')
  getUserpermissions(@Param('id') userid: string){
   return this.userService.getUserPermissions(+userid);
  }
  
}
