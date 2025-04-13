import { IsUUID, IsString, IsISO8601, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BaseEventDto {
  @IsString()
  eventType: string;
  
  @IsISO8601()
  @Type(() => Date)
  timestamp: string;
  
  @IsObject()
  payload: any;
  
  @IsString()
  source: string;
  
  @IsUUID()
  correlationId: string;
}