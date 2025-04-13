import { Module } from '@nestjs/common';
import { TemplatesController } from './templates.controller'; 
import { TemplatesService } from './template.service';  
import { TypeOrmModule } from '@nestjs/typeorm';
import { Template } from './entities/template.entity';
import { TemplateRepository } from './repositories/template.repository';

@Module({
    imports: [
            TypeOrmModule.forFeature([Template, ]), 
          ],
    controllers: [TemplatesController],  // Add the controller here
    providers: [TemplatesService, TemplateRepository],  // Add the service here if necessary
  })
export class TemplatesModule {}
