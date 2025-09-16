import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import type { WsAuthenticatedSocket } from '../auth/interfaces/ws-authenticated-socket.interface';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
  namespace: '/chat'
})
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');
  private userSockets: Map<string, Socket[]> = new Map();

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: WsAuthenticatedSocket) {
    try {
      const userId = client.user?.id;
      if (!userId) {
        client.disconnect();
        return;
      }

      // Adicionar socket à lista do usuário
      const userSocketList = this.userSockets.get(userId) || [];
      userSocketList.push(client);
      this.userSockets.set(userId, userSocketList);

      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);

      // Juntar o usuário às salas das suas conversas
      const conversations = await this.chatService.getConversations(userId, { page: 1, limit: 100 });
      for (const conversation of conversations.conversations) {
        client.join(`conversation:${conversation.id}`);
      }

      // Enviar contador de mensagens não lidas
      const unreadCount = await this.chatService.getUnreadCount(userId);
      client.emit('unread_count', unreadCount);

      // Notificar outros usuários que este usuário está online
      client.broadcast.emit('user_online', { userId });
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: WsAuthenticatedSocket) {
    const userId = client.user?.id;
    if (!userId) return;

    // Remover socket da lista do usuário
    const userSocketList = this.userSockets.get(userId) || [];
    const updatedList = userSocketList.filter(socket => socket.id !== client.id);
    
    if (updatedList.length === 0) {
      this.userSockets.delete(userId);
      // Notificar outros usuários que este usuário está offline
      client.broadcast.emit('user_offline', { userId });
    } else {
      this.userSockets.set(userId, updatedList);
    }

    this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
  }

  @SubscribeMessage('send_message')
  @UsePipes(new ValidationPipe())
  async handleSendMessage(
    @MessageBody() data: { conversationId: string; message: CreateMessageDto },
    @ConnectedSocket() client: WsAuthenticatedSocket,
  ) {
    try {
      const { conversationId, message } = data;
      const userId = client.user.id;

      // Enviar mensagem através do service
      const savedMessage = await this.chatService.sendMessage(conversationId, message, userId);

      // Emitir mensagem para todos os participantes da conversa
      this.server.to(`conversation:${conversationId}`).emit('new_message', {
        conversationId,
        message: savedMessage,
      });

      // Atualizar contador de não lidas para outros participantes
      const conversation = await this.chatService.getConversation(conversationId, userId);
      for (const participant of conversation.participants) {
        if (participant.userId !== userId) {
          const userSockets = this.userSockets.get(participant.userId);
          if (userSockets) {
            const unreadCount = await this.chatService.getUnreadCount(participant.userId);
            userSockets.forEach(socket => {
              socket.emit('unread_count', unreadCount);
            });
          }
        }
      }

      return { success: true, message: savedMessage };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: WsAuthenticatedSocket,
  ) {
    try {
      const { conversationId } = data;
      const userId = client.user.id;

      // Verificar se o usuário tem acesso à conversa
      await this.chatService.getConversation(conversationId, userId);

      // Juntar à sala da conversa
      client.join(`conversation:${conversationId}`);
      
      this.logger.log(`User ${userId} joined conversation ${conversationId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error joining conversation: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('leave_conversation')
  async handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: WsAuthenticatedSocket,
  ) {
    const { conversationId } = data;
    const userId = client.user.id;

    client.leave(`conversation:${conversationId}`);
    
    this.logger.log(`User ${userId} left conversation ${conversationId}`);
    return { success: true };
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: WsAuthenticatedSocket,
  ) {
    try {
      const { conversationId } = data;
      const userId = client.user.id;

      await this.chatService.markAsRead(conversationId, userId);

      // Atualizar contador de não lidas
      const unreadCount = await this.chatService.getUnreadCount(userId);
      client.emit('unread_count', unreadCount);

      // Notificar outros participantes que as mensagens foram lidas
      client.to(`conversation:${conversationId}`).emit('message_read', {
        conversationId,
        userId,
        timestamp: new Date(),
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Error marking as read: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { conversationId: string; isTyping: boolean },
    @ConnectedSocket() client: WsAuthenticatedSocket,
  ) {
    const { conversationId, isTyping } = data;
    const userId = client.user.id;

    // Notificar outros participantes sobre digitação
    client.to(`conversation:${conversationId}`).emit('user_typing', {
      conversationId,
      userId,
      isTyping,
    });

    return { success: true };
  }

  // Métodos para emitir eventos programaticamente

  async notifyNewConversation(conversationId: string, participantIds: string[]) {
    for (const participantId of participantIds) {
      const userSockets = this.userSockets.get(participantId);
      if (userSockets) {
        const conversation = await this.chatService.getConversation(conversationId, participantId);
        userSockets.forEach(socket => {
          socket.join(`conversation:${conversationId}`);
          socket.emit('new_conversation', { conversation });
        });
      }
    }
  }

  async notifyConversationUpdate(conversationId: string) {
    this.server.to(`conversation:${conversationId}`).emit('conversation_updated', {
      conversationId,
      timestamp: new Date(),
    });
  }

  async notifyParticipantAdded(conversationId: string, newParticipantId: string) {
    // Notificar participantes existentes
    this.server.to(`conversation:${conversationId}`).emit('participant_added', {
      conversationId,
      participantId: newParticipantId,
    });

    // Adicionar novo participante à sala
    const userSockets = this.userSockets.get(newParticipantId);
    if (userSockets) {
      const conversation = await this.chatService.getConversation(conversationId, newParticipantId);
      userSockets.forEach(socket => {
        socket.join(`conversation:${conversationId}`);
        socket.emit('new_conversation', { conversation });
      });
    }
  }

  async notifyParticipantRemoved(conversationId: string, removedParticipantId: string) {
    // Notificar participantes restantes
    this.server.to(`conversation:${conversationId}`).emit('participant_removed', {
      conversationId,
      participantId: removedParticipantId,
    });

    // Remover participante da sala
    const userSockets = this.userSockets.get(removedParticipantId);
    if (userSockets) {
      userSockets.forEach(socket => {
        socket.leave(`conversation:${conversationId}`);
        socket.emit('conversation_removed', { conversationId });
      });
    }
  }

  getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}