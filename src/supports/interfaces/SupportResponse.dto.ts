export interface SupportRequestDto {
  id: string;
  createdAt: string;
  isActive: boolean;
  hasNewMessages: boolean;
  lastMessage: MessageDto;
}

export interface MessageDto {
  id: string;
  sentAt: string;
  text: string;
  readAt: string | null;
  author: {
    id: string;
    name: string;
  };
}

export interface SupportResponseMessageDto {
  id: string;
  isActive: boolean;
  messages: MessageDto[];
}
