import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';


@Controller('stock/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto, @Req() req) {
    const creatorId = req?.user.id
    return this.productsService.create(createProductDto, creatorId);
  }

  @Get()
  findAll(@Query() query: {filters?: string, page: number, limit: number, sort: string}){
    let {filters, limit, page, sort} = query;
    let filter = [];
    let sortValue: any = {createdAt: 'asc'}
    if(filters){
     filter  = JSON.parse(filters);
    }
    if(sort){
      sortValue = JSON.parse(sort);
    }
    return this.productsService.findAll(filter, limit, page, sortValue);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Req() req) {
    const updaterId = req?.user.id
    return this.productsService.update(+id, updateProductDto, updaterId);
  }

  @Delete()
  remove(@Body('ids') ids: number[]) {
    return this.productsService.remove(ids);
  }
  @Patch(':id/block')
  toggleBlock(@Param('id') productId: string){
    return this.productsService.toggleBlock(+productId);
  }
  @Patch(':id/lock')
  toggleLock(@Param('id') productId: string){
    return this.productsService.toggleLock(+productId);
  }
}
