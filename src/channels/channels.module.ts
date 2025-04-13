import { Module } from '@nestjs/common';
import { EmailChannelService } from './email/email.service';
import { InAppChannelService } from './in-app/in-app.service';

@Module({
    imports: [],
    controllers: [],
    providers: [EmailChannelService, InAppChannelService],
    exports: [EmailChannelService, InAppChannelService],
})
export class ChannelsModule {}
