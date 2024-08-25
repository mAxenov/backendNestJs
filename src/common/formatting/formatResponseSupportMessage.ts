import { MessageDto } from 'src/supports/interfaces/SupportResponse.dto';
import { MessageDocument } from 'src/supports/schemes/Message.schema';

export const formatResponseSupportMessage = (
  message: MessageDocument,
): MessageDto => ({
  id: message._id.toString(),
  sentAt: new Date(message.sentAt.valueOf() as string).toISOString(),
  text: message.text,
  readAt: message.readAt
    ? new Date(message.readAt.valueOf() as string).toISOString()
    : null,
  author: {
    id: message.author._id.toString(),
    name: message.author.name,
  },
});
