import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { TemplateRepository } from './repositories/template.repository';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
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
  
  async create(createTemplateDto: CreateTemplateDto): Promise<Template> {
    // Validate template variables against content
    this.validateTemplateVariables(createTemplateDto.content, createTemplateDto.variables);
    
    return this.templateRepository.create(createTemplateDto);
  }
  
  async update(id: string, updateTemplateDto: UpdateTemplateDto): Promise<Template> {
    const template = await this.findById(id);
    
    if (updateTemplateDto.content || updateTemplateDto.variables) {
      const content = updateTemplateDto.content || template.content;
      const variables = updateTemplateDto.variables || template.variables;
      
      this.validateTemplateVariables(content, variables);
      
      // Clear compiled template cache
      this.compiledTemplates.delete(id);
    }
    
    return this.templateRepository.update(id, updateTemplateDto);
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
  
  private validateTemplateVariables(content: string, variables: string[]): void {
    try {
      // Parse the template to find used variables
      const ast = Handlebars.parse(content);
      const usedVariables = new Set<string>();
      
      // Helper function to recursively extract variables
      const extractVariables = (node: any) => {
        if (node.type === 'MustacheStatement' || node.type === 'SubExpression') {
          if (node.path.type === 'PathExpression') {
            usedVariables.add(node.path.parts[0]);
          }
        }
        
        if (node.program) {
          node.program.body.forEach(extractVariables);
        }
        
        if (node.inverse) {
          node.inverse.body.forEach(extractVariables);
        }
      };
      
      ast.body.forEach(extractVariables);
      
      // Check if all used variables are defined
      const undefinedVariables = Array.from(usedVariables).filter(
        variable => !variables.includes(variable)
      );
      
      if (undefinedVariables.length > 0) {
        throw new Error(
          `Template uses undefined variables: ${undefinedVariables.join(', ')}`
        );
      }
    } catch (error) {
      if (error.message.startsWith('Template uses undefined variables')) {
        throw error;
      }
      
      throw new Error(`Invalid template syntax: ${error.message}`);
    }
  }
}