import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { TemplateRepository } from './repositories/template.repository';
import { Template } from './entities/template.entity';
import * as Handlebars from 'handlebars';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);
  private compiledTemplates: Map<string, HandlebarsTemplateDelegate> = new Map();
  
  constructor(private readonly templateRepository: TemplateRepository) {}
  
  async findAll(): Promise<Template[]> {
    return this.templateRepository.findAll();
  }
  
  async findById(id: string): Promise<Template> {
    return this.templateRepository.findById(id);
  }
  
  async findTemplateByType(type: string): Promise<Template[]> {
    return this.templateRepository.findByType(type);
  }
  
  async renderTemplate(templateId: string, data: Record<string, any>): Promise<string> {
    const template = await this.findById(templateId);
    
    try {
      let compiledTemplate = this.compiledTemplates.get(templateId);
      
      if (!compiledTemplate) {
        compiledTemplate = Handlebars.compile(template.content);
        this.compiledTemplates.set(templateId, compiledTemplate);
      }
      
      return compiledTemplate(data);
    } catch (error) {
      this.logger.error(`Error rendering template ${templateId}: ${error.message}`, error.stack);
      throw new Error(`Failed to render template: ${error.message}`);
    }
  }

}