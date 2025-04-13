import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, IsOptional } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string; // Template name or identifier
  
  @IsString()
  @IsNotEmpty()
  content: string; // Handlebars template content
  
  @IsArray()
  @ArrayNotEmpty()
  variables: string[]; // Variables used in the template (to validate against the content)
  
  @IsString()
  @IsOptional()
  type?: string; // Optional, can define template type (e.g., 'email', 'sms', etc.)
}
