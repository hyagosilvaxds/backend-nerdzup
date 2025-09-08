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
import { LeadFormsService } from './lead-forms.service';
import { CreateLeadFormDto } from './dto/create-lead-form.dto';
import { UpdateLeadFormDto } from './dto/update-lead-form.dto';
import { GetLeadFormQueryDto } from './dto/get-lead-form.dto';

@Controller('lead-forms')
export class LeadFormsController {
  constructor(private readonly leadFormsService: LeadFormsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createLeadFormDto: CreateLeadFormDto) {
    return this.leadFormsService.create(createLeadFormDto);
  }

  @Get()
  findAll(@Query() query: GetLeadFormQueryDto) {
    return this.leadFormsService.findAll(query.activeOnly);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadFormsService.findOne(id);
  }

  @Get('name/:name')
  findByName(@Param('name') name: string) {
    return this.leadFormsService.findByName(name);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeadFormDto: UpdateLeadFormDto) {
    return this.leadFormsService.update(id, updateLeadFormDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.leadFormsService.remove(id);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  activate(@Param('id') id: string) {
    return this.leadFormsService.activate(id);
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  deactivate(@Param('id') id: string) {
    return this.leadFormsService.deactivate(id);
  }

  @Get(':id/analytics')
  getAnalytics(@Param('id') id: string) {
    return this.leadFormsService.getFormAnalytics(id);
  }

  @Post(':id/duplicate')
  @HttpCode(HttpStatus.CREATED)
  duplicate(
    @Param('id') id: string,
    @Body() body: { name: string; displayName: string }
  ) {
    return this.leadFormsService.duplicateForm(id, body.name, body.displayName);
  }
}