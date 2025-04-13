import { ApiProperty } from '@nestjs/swagger';

export class TemplateResponseDto {
  @ApiProperty({
    description: 'The unique identifier for the template',
    example: 'b2a0e81b-c0e3-40a0-8a22-01c93734068b',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the template',
    example: 'Welcome Email',
  })
  name: string;

  @ApiProperty({
    description: 'The content of the template (Handlebars syntax)',
    example: '<h1>Welcome {{name}}</h1>',
  })
  content: string;

  @ApiProperty({
    description: 'The list of variables used in the template',
    example: ['name'],
  })
  variables: string[];

  @ApiProperty({
    description: 'The type of the template (optional)',
    example: 'email',
  })
  type: string;

  @ApiProperty({
    description: 'The timestamp when the template was created',
    example: '2025-04-13T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The timestamp when the template was last updated',
    example: '2025-04-13T12:00:00Z',
  })
  updatedAt: Date;

  constructor(template: any) {
    this.id = template.id;
    this.name = template.name;
    this.content = template.content;
    this.variables = template.variables;
    this.type = template.type || 'general'; // Default to 'general' if no type is provided
    this.createdAt = template.createdAt;
    this.updatedAt = template.updatedAt;
  }
}
