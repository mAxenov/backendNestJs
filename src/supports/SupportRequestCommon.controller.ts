import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SupportRequestService } from './SupportRequest.service';
import {
  MarkMessagesAsReadDto,
  SendMessageDto,
} from './interfaces/SupportRequest.interfaces';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { Roles } from 'src/auth/guards/roles';
import { GetUser } from 'src/auth/GetUser';
import { UserDocument } from 'src/user/schemes/user.schema';

@Controller('/common/support-requests/:id')
@Roles('client', 'manager')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupportRequestCommonController {
  constructor(private readonly supportRequestService: SupportRequestService) {}

  @Get('messages')
  async getMessages(@Param('id') supportRequestId: string) {
    return this.supportRequestService.getMessages(supportRequestId);
  }

  @Post('messages')
  async sendMessage(
    @Param('id') supportRequestId: string,
    @Body() sendMessageDto: SendMessageDto,
    @GetUser() user: UserDocument,
  ) {
    return this.supportRequestService.sendMessage({
      ...sendMessageDto,
      supportRequest: supportRequestId,
      author: user._id,
    });
  }

  @Post('messages/read')
  async markMessagesAsRead(
    @Param('id') supportRequestId: string,
    @Body() markAsReadDto: MarkMessagesAsReadDto,
  ) {
    return this.supportRequestService.markMessagesAsRead({
      ...markAsReadDto,
      supportRequest: supportRequestId,
    });
  }
}
