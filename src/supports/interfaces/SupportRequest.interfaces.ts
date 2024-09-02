import { ObjectId } from 'mongoose';
// import { Message } from '../schemes/Message.schema';
import { SupportRequest } from '../schemes/SupportRequest.schema';
import { MessageDto } from './SupportResponse.dto';

export type ID = string | ObjectId;

export interface CreateSupportRequestDto {
  user: ID;
  text: string;
}

export interface SendMessageDto {
  author: ID;
  supportRequest: ID;
  text: string;
}

export interface MarkMessagesAsReadDto {
  user: ID;
  supportRequest: ID;
}

export interface GetChatListParams {
  user: ID | null;
  isActive: boolean;
}

export interface ISupportRequestService {
  findSupportRequests(params: GetChatListParams): Promise<SupportRequest[]>;
  sendMessage(data: SendMessageDto): Promise<MessageDto>;
  getMessages(supportRequest: ID): Promise<MessageDto[]>;
  // subscribe(
  //   handler: (supportRequest: SupportRequest, message: Message) => void,
  // ): () => void;
  markMessagesAsRead(params: MarkMessagesAsReadDto): Promise<void>;
  getUnreadCount(supportRequest: ID): Promise<number>;
}

export interface ISupportRequestClientService {
  createSupportRequest(data: CreateSupportRequestDto);
}

export interface ISupportRequestEmployeeService {
  closeRequest(supportRequest: ID): Promise<void>;
  findSupportRequests(params: GetChatListParams);
}
