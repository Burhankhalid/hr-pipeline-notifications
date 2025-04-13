import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  name: string;
  
  @Column({ type: 'text', nullable: true })
  description: string;
  
  @Column()
  type: string;
  
  @Column({ type: 'text' })
  content: string;
  
  @Column({ type: 'jsonb' })
  variables: string[];
  
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
  
  @Column({ default: true })
  active: boolean;
}