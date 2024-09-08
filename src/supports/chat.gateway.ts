import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SupportRequestService } from './SupportRequest.service';
import { OnEvent } from '@nestjs/event-emitter';

// import { UseGuards } from '@nestjs/common';
// import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
// import { Roles } from 'src/auth/guards/roles';
// import { RolesGuard } from 'src/auth/guards/roles.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(private readonly supportRequestService: SupportRequestService) {}
  afterInit(server: Server) {
    console.log(server);
    // Инициализация сервера WebSocket, если это необходимо
  }

  // @Roles('client')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @SubscribeMessage('subscribeToChat')
  async handleSubscribeToChat(
    @MessageBody() chatId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(chatId);
  }

  // @Roles('client')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  async sendMessage(chatId: string, message: any) {
    this.server.to(chatId).emit('subscribeToChat', message);
  }

  @OnEvent('message')
  handleSendMessage(data) {
    this.sendMessage(data.id.toString(), data.message);
  }
}
