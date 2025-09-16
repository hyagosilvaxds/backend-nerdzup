import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateConversationDto, AddParticipantDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { QueryConversationsDto } from './dto/query-conversations.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { MessageType } from '@prisma/client';
import { UploadService } from '../upload/upload.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly uploadService: UploadService
  ) {}

  // =============== CONVERSATIONS ===============

  @Post('conversations')
  async createConversation(@Body() createDto: CreateConversationDto, @Request() req) {
    return this.chatService.createConversation(createDto, req.user.id);
  }

  @Get('conversations')
  async getConversations(@Query() query: QueryConversationsDto, @Request() req) {
    return this.chatService.getConversations(req.user.id, query);
  }

  @Get('conversations/:id')
  async getConversation(@Param('id') id: string, @Request() req) {
    return this.chatService.getConversation(id, req.user.id);
  }

  @Put('conversations/:id')
  async updateConversation(
    @Param('id') id: string,
    @Body() updateDto: UpdateConversationDto,
    @Request() req
  ) {
    return this.chatService.updateConversation(id, updateDto, req.user.id);
  }

  @Post('conversations/:id/participants')
  async addParticipant(
    @Param('id') id: string,
    @Body() addDto: AddParticipantDto,
    @Request() req
  ) {
    return this.chatService.addParticipant(id, addDto, req.user.id);
  }

  @Delete('conversations/:id/participants/:participantId')
  async removeParticipant(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @Request() req
  ) {
    return this.chatService.removeParticipant(id, participantId, req.user.id);
  }

  @Post('conversations/:id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.chatService.markAsRead(id, req.user.id);
  }

  // =============== MESSAGES ===============

  @Post('conversations/:id/messages')
  async sendMessage(
    @Param('id') id: string,
    @Body() createDto: CreateMessageDto,
    @Request() req
  ) {
    return this.chatService.sendMessage(id, createDto, req.user.id);
  }

  @Post('conversations/:id/messages/file')
  @UseInterceptors(FileInterceptor('file'))
  async sendFileMessage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('content') content: string,
    @Body('replyToId') replyToId: string,
    @Request() req
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Upload do arquivo
    const fileUrl = await this.uploadService.uploadFile(file, 'chat-files');

    // Determinar tipo da mensagem baseado no MIME type
    let messageType: MessageType = MessageType.FILE;
    if (file.mimetype.startsWith('image/')) {
      messageType = MessageType.IMAGE;
    } else if (
      file.mimetype === 'application/pdf' ||
      file.mimetype.startsWith('application/vnd.') ||
      file.mimetype.startsWith('text/')
    ) {
      messageType = MessageType.DOCUMENT;
    }

    const messageDto: CreateMessageDto = {
      content: content || undefined,
      messageType,
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      replyToId: replyToId || undefined
    };

    return this.chatService.sendMessage(id, messageDto, req.user.id);
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Param('id') id: string,
    @Query() query: QueryMessagesDto,
    @Request() req
  ) {
    return this.chatService.getMessages(id, req.user.id, query);
  }

  @Put('messages/:id')
  async updateMessage(
    @Param('id') id: string,
    @Body() updateDto: UpdateMessageDto,
    @Request() req
  ) {
    return this.chatService.updateMessage(id, updateDto, req.user.id);
  }

  @Delete('messages/:id')
  async deleteMessage(@Param('id') id: string, @Request() req) {
    return this.chatService.deleteMessage(id, req.user.id);
  }

  // =============== UTILITY ===============

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    return this.chatService.getUnreadCount(req.user.id);
  }
}