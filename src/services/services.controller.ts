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
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { QueryServicesDto, UpdateServiceRatingDto } from './dto/query-services.dto';
import { UploadService } from '../upload/upload.service';

@Controller('services')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly uploadService: UploadService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Post('with-icon')
  @UseInterceptors(FileInterceptor('icon'))
  @HttpCode(HttpStatus.CREATED)
  async createWithIcon(
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File
  ) {
    // Validate required fields
    if (!body.name || !body.displayName || !body.categoryId) {
      throw new BadRequestException('Missing required fields: name, displayName, categoryId');
    }

    let createServiceDto: CreateServiceDto;
    try {
      // Convert form data strings to proper types
      createServiceDto = {
        name: body.name,
        displayName: body.displayName,
        description: body.description,
        shortDescription: body.shortDescription,
        categoryId: body.categoryId,
        credits: parseInt(body.credits) || 0,
        estimatedDays: parseInt(body.estimatedDays) || 1,
        difficulty: body.difficulty,
        features: body.features ? JSON.parse(body.features) : [],
        benefits: body.benefits ? JSON.parse(body.benefits) : [],
        tags: body.tags ? JSON.parse(body.tags) : [],
        isActive: body.isActive === 'true' || body.isActive === true,
        isFeatured: body.isFeatured === 'true' || body.isFeatured === true,
        iconUrl: body.iconUrl,
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException('Invalid JSON format in features, benefits, or tags');
      }
      throw error;
    }

    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed');
      }

      // Validate file size (1GB limit)
      const maxSize = 1024 * 1024 * 1024; // 1GB
      if (file.size > maxSize) {
        throw new BadRequestException('File too large. Maximum size is 1GB');
      }

      const iconUrl = await this.uploadService.uploadFile(file, 'service-icons');
      createServiceDto.iconUrl = iconUrl;
    }

    return this.servicesService.create(createServiceDto);
  }

  @Post(':id/upload-icon')
  @UseInterceptors(FileInterceptor('icon'))
  @HttpCode(HttpStatus.OK)
  async uploadIcon(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed');
    }

    // Validate file size (1GB limit)
    const maxSize = 1024 * 1024 * 1024; // 1GB
    if (file.size > maxSize) {
      throw new BadRequestException('File too large. Maximum size is 1GB');
    }

    const iconUrl = await this.uploadService.uploadFile(file, 'service-icons');
    return this.servicesService.updateIcon(id, iconUrl);
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