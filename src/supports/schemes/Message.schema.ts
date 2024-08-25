import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date, Document, Types } from 'mongoose';
import { UserDocument } from 'src/user/schemes/user.schema';

export type MessageDocument = Message & Document;

@Schema()
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: UserDocument;

  @Prop({ type: Date, required: true })
  sentAt: Date;

  @Prop({ type: Date, default: null })
  readAt: Date;

  @Prop({ required: true })
  text: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
