import { Controller, Get, Post, Put, Body, Param, UseInterceptors, UseFilters } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TemplatesService } from './template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateResponseDto } from './dto/template-response.dto';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';

@ApiTags('templates')
@Controller('api/templates')
@UseInterceptors(LoggingInterceptor)
@UseFilters(HttpExceptionFilter)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}
  
  @Get()
  @ApiOperation({ summary: 'Get all templates' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all templates', 
    type: [TemplateResponseDto] 
  })
  async findAll(): Promise<TemplateResponseDto[]> {
    const templates = await this.templatesService.findAll();
    return templates.map(template => new TemplateResponseDto(template));
  }
  
  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'Return the template', 
    type: TemplateResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async findOne(@Param('id') id: string): Promise<TemplateResponseDto> {
    const template = await this.templatesService.findById(id);
    return new TemplateResponseDto(template);
  }
  
  @Post()
  @ApiOperation({ summary: 'Create a new template' })
  @ApiResponse({ 
    status: 201, 
    description: 'The template has been successfully created', 
    type: TemplateResponseDto 
  })
  async create(@Body() createTemplateDto: CreateTemplateDto): Promise<TemplateResponseDto> {
    const template = await this.templatesService.create(createTemplateDto);
    return new TemplateResponseDto(template);
  }
  
  @Put(':id')
  @ApiOperation({ summary: 'Update an existing template' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'The template has been successfully updated', 
    type: TemplateResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async update(
    @Param('id') id: string, 
    @Body() updateTemplateDto: UpdateTemplateDto
  ): Promise<TemplateResponseDto> {
    const template = await this.templatesService.update(id, updateTemplateDto);
    return new TemplateResponseDto(template);
  }
}