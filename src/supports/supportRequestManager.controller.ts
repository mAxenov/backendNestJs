import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { SupportRequestEmployeeService } from './SupportRequest.service';
import { GetChatListParams } from './interfaces/SupportRequest.interfaces';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/guards/roles';
import { GetUser } from 'src/auth/GetUser';
import { UserDocument } from 'src/user/schemes/user.schema';

@Controller('/manager/support-requests')
@Roles('manager')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupportRequestManagerController {
  constructor(
    private readonly supportRequestEmployeeService: SupportRequestEmployeeService,
  ) {}

  @Get()
  async getSupportRequests(
    @Query() query: GetChatListParams,
    @GetUser() user: UserDocument,
  ) {
    return this.supportRequestEmployeeService.findSupportRequests({
      isActive: query.isActive,
      user: user._id,
    });
  }

  @Post('/:id/close')
  async closeSupportRequest(@Param('id') supportRequestId: string) {
    return this.supportRequestEmployeeService.closeRequest(supportRequestId);
  }
}
