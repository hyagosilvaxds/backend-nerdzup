import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  Query,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { LeadSubmissionsService } from './lead-submissions.service';
import { SubmitLeadFormDto, StartLeadFormDto, CompleteLeadFormDto } from './dto/submit-lead-form.dto';
import { GetSubmissionsQueryDto } from './dto/get-lead-form.dto';

@Controller('lead-submissions')
export class LeadSubmissionsController {
  constructor(private readonly leadSubmissionsService: LeadSubmissionsService) {}

  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  startSubmission(@Body() startLeadFormDto: StartLeadFormDto) {
    return this.leadSubmissionsService.startSubmission(startLeadFormDto);
  }

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  submitResponses(@Body() submitLeadFormDto: SubmitLeadFormDto) {
    return this.leadSubmissionsService.submitResponses(submitLeadFormDto);
  }

  @Post('complete')
  @HttpCode(HttpStatus.OK)
  completeSubmission(@Body() completeLeadFormDto: CompleteLeadFormDto) {
    return this.leadSubmissionsService.completeSubmission(completeLeadFormDto);
  }

  @Get()
  findSubmissions(@Query() query: GetSubmissionsQueryDto) {
    return this.leadSubmissionsService.findSubmissions(query);
  }

  @Get('stats')
  getSubmissionStats(@Query('formId') formId?: string) {
    return this.leadSubmissionsService.getSubmissionStats(formId);
  }

  @Get(':id')
  findSubmission(@Param('id') id: string) {
    return this.leadSubmissionsService.findSubmission(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSubmission(@Param('id') id: string) {
    return this.leadSubmissionsService.deleteSubmission(id);
  }
}