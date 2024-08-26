import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter } from 'events';

import {
  CreateSupportRequestDto,
  SendMessageDto,
  GetChatListParams,
  ISupportRequestClientService,
  ISupportRequestEmployeeService,
} from './interfaces/SupportRequest.interfaces';
import { ISupportRequestService } from './interfaces/SupportRequest.interfaces';
import {
  SupportRequest,
  SupportRequestDocument,
} from './schemes/SupportRequest.schema';
import { Message, MessageDocument } from './schemes/Message.schema';
import { MessageDto } from './interfaces/SupportResponse.dto';
import { formatResponseSupportMessage } from 'src/common/formatting/formatResponseSupportMessage';

@Injectable()
export class SupportRequestService implements ISupportRequestService {
  public readonly eventEmitter = new EventEmitter();

  constructor(
    @InjectModel(SupportRequest.name)
    private readonly supportRequestModel: Model<SupportRequestDocument>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  async findSupportRequests(
    params: GetChatListParams,
  ): Promise<SupportRequest[]> {
    const query: any = {};
    if (params.user) {
      query.user = params.user;
    }
    if (typeof params.isActive !== 'undefined') {
      query.isActive = params.isActive;
    }

    const supportRequests = await this.supportRequestModel.find(query).exec();

    for (const supportRequest of supportRequests) {
      await supportRequest.populate({
        path: 'messages.author',
        select: 'name',
      });
    }
    return supportRequests;
  }

  async sendMessage(data: SendMessageDto): Promise<MessageDto> {
    const supportRequest = await this.supportRequestModel.findById(
      data.supportRequest,
    );
    if (!supportRequest) {
      throw new NotFoundException('Support request not found');
    }

    const message = new this.messageModel({
      author: data.author,
      text: data.text,
      sentAt: new Date(),
    });

    supportRequest.messages.push(message);
    await supportRequest.save();

    this.eventEmitter.emit('message', supportRequest, message);

    const messagePopulated = await message.populate('author');

    return formatResponseSupportMessage(messagePopulated as MessageDocument);
  }

  async getMessages(supportRequest: string): Promise<MessageDto[]> {
    const supportRequestDoc = await this.supportRequestModel
      .findById(supportRequest)
      .populate({
        path: 'messages.author',
        select: 'name',
      })
      .sort({ 'messages.sentAt': -1 })
      .exec();
    if (!supportRequestDoc) {
      throw new NotFoundException('Support request not found');
    }

    // const formattedMessages: MessageDocument[] = ;
    return supportRequestDoc.messages.map((message) =>
      formatResponseSupportMessage(message as MessageDocument),
    );
  }

  subscribe(
    handler: (supportRequest: SupportRequest, message: Message) => void,
  ): () => void {
    this.eventEmitter.on('message', handler);
    return () => this.eventEmitter.off('message', handler);
  }

  async markMessagesAsRead(params): Promise<void> {
    const supportRequest = await this.supportRequestModel
      .findById(params.supportRequest)
      .exec();
    supportRequest.messages.forEach((message) => {
      if (message.author.toString() !== params.user.toString()) {
        message.readAt = new Date() as any;
      }
    });
    await supportRequest.save();
  }

  async getUnreadCount(supportRequest: string): Promise<number> {
    const supportRequestDoc = await this.supportRequestModel
      .findById(supportRequest)
      .exec();
    if (!supportRequestDoc) {
      throw new NotFoundException('Support request not found');
    }

    return supportRequestDoc.messages.filter(
      (message) =>
        message.author.toString() !== supportRequestDoc.user.toString() &&
        !message.readAt,
    ).length;
  }
}

@Injectable()
export class SupportRequestClientService
  implements ISupportRequestClientService
{
  constructor(
    @InjectModel(SupportRequest.name)
    private readonly supportRequestModel: Model<SupportRequestDocument>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    private readonly supportRequestService: SupportRequestService,
  ) {}

  async createSupportRequest(data: CreateSupportRequestDto) {
    const supportRequest = new this.supportRequestModel({
      user: data.user,
      createdAt: new Date(),
      isActive: true,
    });

    const message = new this.messageModel({
      author: data.user,
      text: data.text,
      sentAt: new Date(),
    });

    supportRequest.messages.push(message);
    await supportRequest.save();

    this.supportRequestService.eventEmitter.emit(
      'message',
      supportRequest,
      message,
    );
    return {
      id: supportRequest._id,
      createdAt: supportRequest.createdAt,
      isActive: supportRequest.isActive,
      hasNewMessages: true,
    };
  }

  async findSupportRequests(params: GetChatListParams) {
    const { user, isActive } = params;
    const filter = { user };
    if (isActive !== undefined) {
      filter['isActive'] = isActive;
    }
    const supportRequests = await this.supportRequestModel
      .find(filter)
      .populate({
        path: 'messages.author',
        select: 'name',
      })
      .sort({ 'messages.sentAt': -1 })
      .exec();

    return supportRequests.map((supportRequest) => {
      const lastMessage = supportRequest.messages[
        supportRequest.messages.length - 1
      ] as MessageDocument;

      return {
        id: supportRequest._id.toString(),
        createdAt: new Date(
          supportRequest.createdAt.valueOf() as string,
        ).toISOString(),
        hasNewMessages: supportRequest.messages.some(
          (message) =>
            message.author._id.toString() !== user.toString() &&
            !message.readAt,
        ),
        isActive: supportRequest.isActive,
        lastMessage: lastMessage
          ? {
              id: lastMessage._id.toString(),
              sentAt: new Date(
                lastMessage.sentAt.valueOf() as string,
              ).toISOString(),
              text: lastMessage.text,
              readAt: lastMessage.readAt
                ? new Date(lastMessage.readAt.valueOf() as string).toISOString()
                : null,
              author: {
                id: lastMessage.author._id.toString(),
                name: lastMessage.author.name,
              },
            }
          : null,
        unreadCount: supportRequest.messages.filter(
          (message) =>
            message.author._id.toString() !== user.toString() &&
            !message.readAt,
        ).length,
      };
    });
  }
}

@Injectable()
export class SupportRequestEmployeeService
  implements ISupportRequestEmployeeService
{
  constructor(
    @InjectModel(SupportRequest.name)
    private readonly supportRequestModel: Model<SupportRequestDocument>,
  ) {}

  async closeRequest(supportRequest: string): Promise<void> {
    const supportRequestDoc = await this.supportRequestModel
      .findById(supportRequest)
      .exec();
    if (!supportRequestDoc) {
      throw new NotFoundException('Support request not found');
    }

    supportRequestDoc.isActive = false;
    await supportRequestDoc.save();
  }

  async findSupportRequests(params: GetChatListParams) {
    const { user, isActive } = params;
    const filter = {};
    if (isActive !== undefined) {
      filter['isActive'] = isActive;
    }
    const supportRequests = await this.supportRequestModel
      .find(filter)
      .populate('user', ['name', 'contactPhone', 'email'])
      .populate({
        path: 'messages.author',
        select: 'name',
      })
      .sort({ 'messages.sentAt': -1 })
      .exec();

    return supportRequests.map((supportRequest) => {
      const lastMessage = supportRequest.messages[
        supportRequest.messages.length - 1
      ] as MessageDocument;

      return {
        id: supportRequest._id.toString(),
        createdAt: new Date(
          supportRequest.createdAt.valueOf() as string,
        ).toISOString(),
        hasNewMessages: supportRequest.messages.some(
          (message) =>
            message.author._id.toString() !== user.toString() &&
            !message.readAt,
        ),
        isActive: supportRequest.isActive,
        lastMessage: lastMessage
          ? {
              id: lastMessage._id.toString(),
              sentAt: new Date(
                lastMessage.sentAt.valueOf() as string,
              ).toISOString(),
              text: lastMessage.text,
              readAt: lastMessage.readAt
                ? new Date(lastMessage.readAt.valueOf() as string).toISOString()
                : null,
              author: {
                id: lastMessage.author._id.toString(),
                name: lastMessage.author.name,
              },
            }
          : null,
        client: {
          id: supportRequest.user._id.toString(),
          name: supportRequest.user.name,
          email: supportRequest.user.email,
          contactPhone: supportRequest.user.contactPhone,
        },
        unreadCount: supportRequest.messages.filter(
          (message) =>
            message.author._id.toString() !== user.toString() &&
            !message.readAt,
        ).length,
      };
    });
  }
}
