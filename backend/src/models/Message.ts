import mongoose from 'mongoose';

export interface IMessage extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  content: string;
  isAI: boolean;
  rating?: number;
  createdAt: Date;
}

const messageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isAI: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Message = mongoose.model<IMessage>('Message', messageSchema); 