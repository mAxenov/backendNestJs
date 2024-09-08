import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { SupportRequestClientService } from './SupportRequest.service';
import { Roles } from 'src/auth/guards/roles';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserDocument } from 'src/user/schemes/user.schema';
import { GetUser } from 'src/auth/GetUser';

@Roles('client')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('/client/support-requests')
export class SupportRequestClientController {
  constructor(
    private readonly supportRequestClientService: SupportRequestClientService,
  ) {}

  @Post()
  async createSupportRequest(
    @Body() data: { text: string },
    @GetUser() user: UserDocument,
  ) {
    return this.supportRequestClientService.createSupportRequest({
      text: data.text,
      user: user._id.toString(),
    });
  }

  @Get()
  async getSupportRequests(
    @Query() query: { isActive: boolean },
    @GetUser() user: UserDocument,
  ) {
    return this.supportRequestClientService.findSupportRequests({
      isActive: query.isActive,
      user: user._id.toString(),
    });
  }
}
