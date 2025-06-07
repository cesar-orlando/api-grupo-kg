// src/models/chat.model.ts
import mongoose, { Schema, Document } from "mongoose";

interface IMessage {
  direction: "inbound" | "outbound-bot" | "outbound-human";
  body: string;
  dateCreated?: Date;
  respondedBy: "bot" | "human" | "asesor";
  responseTime?: number;
}

export interface IChat extends Document {
  phone: string;
  name?: string;
  messages: IMessage[];
  propertyInterest?: string; // ID o nombre de propiedad de interés
  advisor?: {
    id: mongoose.Types.ObjectId;
    name: string;
  };
  conversationStart: Date;
}

const MessageSchema = new mongoose.Schema({
  direction: { type: String, enum: ["inbound", "outbound-bot", "outbound-human"], required: true },
  body: { type: String, required: true },
  dateCreated: { type: Date, default: Date.now },
  respondedBy: { type: String, enum: ["bot", "human", "asesor"], required: true },
  responseTime: { type: Number },
});

const ChatSchema: Schema = new mongoose.Schema({
  phone: { type: String, required: true },
  name: { type: String },
  messages: [MessageSchema],
  propertyInterest: { type: String },
  advisor: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String },
  },
  conversationStart: { type: Date, default: Date.now },
});

const Chat = mongoose.model<IChat>("Chat", ChatSchema);
export default Chat;