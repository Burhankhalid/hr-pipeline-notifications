// repositories/template.repository.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from '../entities/template.entity';

@Injectable()
export class TemplateRepository {
  constructor(
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
  ) {}

  async findAll(): Promise<Template[]> {
    return this.templateRepository.find();
  }

  async findByName(name: string): Promise<Template> {
    const template = await this.templateRepository.findOne({
      where: { name },
    });

    if (!template) {
      throw new NotFoundException(`Template with name ${name} not found`);
    }

    return template;
  }

  async findById(id: string): Promise<Template> {
    const template = await this.templateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  
  async findByType(type: string): Promise<Template[]> {
    return this.templateRepository.find({
      where: { type },
    });
  }
}