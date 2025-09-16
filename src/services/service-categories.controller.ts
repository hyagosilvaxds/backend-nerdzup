import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { ServiceCategoriesService } from './service-categories.service';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';
import { QueryServiceCategoriesDto } from './dto/query-services.dto';

@Controller('service-categories')
export class ServiceCategoriesController {
  constructor(private readonly serviceCategoriesService: ServiceCategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createServiceCategoryDto: CreateServiceCategoryDto) {
    return this.serviceCategoriesService.create(createServiceCategoryDto);
  }

  @Get()
  findAll(@Query() query: QueryServiceCategoriesDto) {
    return this.serviceCategoriesService.findAll(query);
  }

  @Get('stats')
  getStats() {
    return this.serviceCategoriesService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceCategoriesService.findOne(id);
  }

  @Get('name/:name')
  findByName(@Param('name') name: string) {
    return this.serviceCategoriesService.findByName(name);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServiceCategoryDto: UpdateServiceCategoryDto) {
    return this.serviceCategoriesService.update(id, updateServiceCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.serviceCategoriesService.remove(id);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  activate(@Param('id') id: string) {
    return this.serviceCategoriesService.activate(id);
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  deactivate(@Param('id') id: string) {
    return this.serviceCategoriesService.deactivate(id);
  }

  @Post('reorder')
  @HttpCode(HttpStatus.OK)
  reorder(@Body() body: { categoryIds: string[] }) {
    return this.serviceCategoriesService.reorder(body.categoryIds);
  }
}