import { IsString, IsOptional, IsArray, ArrayNotEmpty } from 'class-validator';

export class UpdateTemplateDto {
  @IsString()
  @IsOptional()
  name?: string; // Optional field for template name
  
  @IsString()
  @IsOptional()
  content?: string; // Optional, updated content of the template
  
  @IsArray()
  @ArrayNotEmpty()
  @IsOptional()
  variables?: string[]; // Optional, updated list of variables
  
  @IsString()
  @IsOptional()
  type?: string; // Optional, updated template type (e.g., 'email', 'sms', etc.)
}
