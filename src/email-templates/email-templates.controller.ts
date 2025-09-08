import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EmailTemplatesService } from './email-templates.service';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { RenderTemplateDto } from './dto/render-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('email-templates')
@UseGuards(JwtAuthGuard)
export class EmailTemplatesController {
  constructor(private readonly emailTemplatesService: EmailTemplatesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN) // Apenas admins podem criar templates
  async create(@Body() createEmailTemplateDto: CreateEmailTemplateDto) {
    return this.emailTemplatesService.create(createEmailTemplateDto);
  }

  @Get()
  async findAll(@Query('category') category?: string) {
    return this.emailTemplatesService.findAll(category);
  }

  @Get('categories')
  async getCategories() {
    return this.emailTemplatesService.getCategories();
  }

  @Get('by-name/:name')
  async findByName(@Param('name') name: string) {
    return this.emailTemplatesService.findByName(name);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.emailTemplatesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN) // Apenas admins podem editar templates
  async update(
    @Param('id') id: string,
    @Body() updateEmailTemplateDto: UpdateEmailTemplateDto,
  ) {
    return this.emailTemplatesService.update(id, updateEmailTemplateDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN) // Apenas admins podem deletar templates
  async remove(@Param('id') id: string) {
    return this.emailTemplatesService.remove(id);
  }

  @Post(':id/activate')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN) // Apenas admins podem ativar/desativar templates
  async activate(@Param('id') id: string) {
    return this.emailTemplatesService.activate(id);
  }

  @Post(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN) // Apenas admins podem ativar/desativar templates
  async deactivate(@Param('id') id: string) {
    return this.emailTemplatesService.deactivate(id);
  }

  @Post(':id/render')
  async renderTemplate(
    @Param('id') id: string,
    @Body() renderTemplateDto: RenderTemplateDto,
  ) {
    return this.emailTemplatesService.renderTemplate(id, renderTemplateDto.variables);
  }

  @Post('render-by-name/:name')
  async renderTemplateByName(
    @Param('name') name: string,
    @Body() renderTemplateDto: RenderTemplateDto,
  ) {
    return this.emailTemplatesService.renderTemplateByName(name, renderTemplateDto.variables);
  }

  @Post(':id/preview')
  async previewTemplate(
    @Param('id') id: string,
    @Body() renderTemplateDto: RenderTemplateDto,
  ) {
    return this.emailTemplatesService.previewTemplate(id, renderTemplateDto.variables);
  }

  @Post('validate')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN) // Apenas admins podem validar templates
  async validateTemplate(
    @Body() body: {
      htmlContent: string;
      textContent?: string;
      variables?: string[];
    },
  ) {
    return this.emailTemplatesService.validateTemplate(
      body.htmlContent,
      body.textContent,
      body.variables,
    );
  }
}