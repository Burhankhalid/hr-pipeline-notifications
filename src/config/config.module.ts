import { Module } from '@nestjs/common';
import rmqConfig from './rmq.config';

@Module({
    imports: [],
    controllers: [],
    providers: [],
    exports: [rmqConfig],
})
export class ConfigModule {}
