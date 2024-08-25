import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  SupportRequest,
  SupportRequestSchema,
} from './schemes/SupportRequest.schema';
import {
  SupportRequestClientService,
  SupportRequestEmployeeService,
  SupportRequestService,
} from './SupportRequest.service';
import { ChatGateway } from './chat.gateway';
import { SupportRequestClientController } from './supportRequestClient.controller';
import { SupportRequestManagerController } from './supportRequestManager.controller';
import { SupportRequestCommonController } from './SupportRequestCommon.controller';
import { Message, MessageSchema } from './schemes/Message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: SupportRequest.name, schema: SupportRequestSchema },
    ]),
  ],
  controllers: [
    SupportRequestClientController,
    SupportRequestManagerController,
    SupportRequestCommonController,
  ],
  providers: [
    SupportRequestService,
    SupportRequestClientService,
    SupportRequestEmployeeService,
    ChatGateway,
  ],
  exports: [
    SupportRequestService,
    SupportRequestClientService,
    SupportRequestEmployeeService,
  ],
})
export class SupportModule {}
