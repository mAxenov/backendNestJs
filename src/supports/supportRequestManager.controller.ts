import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SupportRequestEmployeeService } from './SupportRequest.service';
import { GetChatListParams } from './interfaces/SupportRequest.interfaces';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/guards/roles';

@Controller('/manager/support-requests')
@Roles('manager')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupportRequestManagerController {
  constructor(
    private readonly supportRequestEmployeeService: SupportRequestEmployeeService,
  ) {}

  @Get()
  async getSupportRequests(@Query() query: GetChatListParams) {
    return this.supportRequestEmployeeService.findSupportRequests(query);
  }
}
