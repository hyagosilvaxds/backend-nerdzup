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
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { QueryServicesDto, UpdateServiceRatingDto } from './dto/query-services.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  findAll(@Query() query: QueryServicesDto) {
    return this.servicesService.findAll(query);
  }

  @Get('featured')
  getFeatured(@Query('limit') limit?: number) {
    return this.servicesService.getFeaturedServices(limit ? Number(limit) : 6);
  }

  @Get('popular')
  getPopular(@Query('limit') limit?: number) {
    return this.servicesService.getPopularServices(limit ? Number(limit) : 6);
  }

  @Get('difficulty/:difficulty')
  getByDifficulty(@Param('difficulty') difficulty: string) {
    return this.servicesService.getServicesByDifficulty(difficulty);
  }

  @Get('stats')
  getStats() {
    return this.servicesService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Get('name/:name')
  findByName(@Param('name') name: string) {
    return this.servicesService.findByName(name);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  activate(@Param('id') id: string) {
    return this.servicesService.activate(id);
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  deactivate(@Param('id') id: string) {
    return this.servicesService.deactivate(id);
  }

  @Post(':id/toggle-featured')
  @HttpCode(HttpStatus.OK)
  toggleFeatured(@Param('id') id: string) {
    return this.servicesService.toggleFeatured(id);
  }

  @Post(':id/rating')
  @HttpCode(HttpStatus.OK)
  updateRating(@Param('id') id: string, @Body() updateRatingDto: UpdateServiceRatingDto) {
    return this.servicesService.updateRating(id, updateRatingDto);
  }

  @Post('category/:categoryId/reorder')
  @HttpCode(HttpStatus.OK)
  reorderInCategory(
    @Param('categoryId') categoryId: string,
    @Body() body: { serviceIds: string[] }
  ) {
    return this.servicesService.reorderInCategory(categoryId, body.serviceIds);
  }
}