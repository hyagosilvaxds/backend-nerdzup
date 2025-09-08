import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto, AddParticipantDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { QueryConversationsDto } from './dto/query-conversations.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { ConversationType, ParticipantRole } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService
  ) {}

  // =============== CONVERSATIONS ===============

  async createConversation(createDto: CreateConversationDto, createdBy: string) {
    // Validação: título obrigatório para grupos
    if (createDto.type === ConversationType.GROUP && !createDto.title) {
      throw new BadRequestException('Title is required for group conversations');
    }

    // Validação: chat individual deve ter exatamente 2 participantes
    if (createDto.type === ConversationType.INDIVIDUAL && createDto.participantIds.length !== 1) {
      throw new BadRequestException('Individual conversations must have exactly 1 other participant');
    }

    // Verificar se já existe conversa individual entre os usuários
    if (createDto.type === ConversationType.INDIVIDUAL) {
      const existingConversation = await this.prisma.conversation.findFirst({
        where: {
          type: ConversationType.INDIVIDUAL,
          AND: [
            {
              participants: {
                some: { userId: createdBy }
              }
            },
            {
              participants: {
                some: { userId: createDto.participantIds[0] }
              }
            }
          ]
        }
      });

      if (existingConversation) {
        return existingConversation;
      }
    }

    // Criar conversa
    const conversation = await this.prisma.conversation.create({
      data: {
        title: createDto.title,
        type: createDto.type,
        taskId: createDto.taskId,
        campaignId: createDto.campaignId,
        createdBy,
        participants: {
          create: [
            // Adicionar criador como admin
            {
              userId: createdBy,
              role: ParticipantRole.ADMIN
            },
            // Adicionar outros participantes
            ...createDto.participantIds.map(userId => ({
              userId,
              role: ParticipantRole.MEMBER
            }))
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profilePhoto: true,
                client: {
                  select: { fullName: true }
                },
                employee: {
                  select: { name: true }
                }
              }
            }
          }
        },
        task: {
          select: { id: true, title: true }
        },
        campaign: {
          select: { id: true, name: true }
        }
      }
    });

    // TODO: Add WebSocket notification for new conversation

    return conversation;
  }

  async getConversations(userId: string, query: QueryConversationsDto) {
    const skip = ((query.page || 1) - 1) * (query.limit || 20);

    const whereConditions: any = {
      participants: {
        some: {
          userId,
          isActive: true
        }
      }
    };

    if (query.type) {
      whereConditions.type = query.type;
    }

    if (query.taskId) {
      whereConditions.taskId = query.taskId;
    }

    if (query.campaignId) {
      whereConditions.campaignId = query.campaignId;
    }

    if (query.search) {
      whereConditions.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        {
          participants: {
            some: {
              user: {
                OR: [
                  { email: { contains: query.search, mode: 'insensitive' } },
                  { client: { fullName: { contains: query.search, mode: 'insensitive' } } },
                  { employee: { name: { contains: query.search, mode: 'insensitive' } } }
                ]
              }
            }
          }
        }
      ];
    }

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where: whereConditions,
        include: {
          participants: {
            where: { isActive: true },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  profilePhoto: true,
                  client: {
                    select: { fullName: true }
                  },
                  employee: {
                    select: { name: true }
                  }
                }
              }
            }
          },
          task: {
            select: { id: true, title: true }
          },
          campaign: {
            select: { id: true, name: true }
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              content: true,
              messageType: true,
              createdAt: true,
              sender: {
                select: {
                  id: true,
                  email: true,
                  client: { select: { fullName: true } },
                  employee: { select: { name: true } }
                }
              }
            }
          }
        },
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: query.limit
      }),
      this.prisma.conversation.count({
        where: whereConditions
      })
    ]);

    return {
      conversations,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 20,
        total,
        totalPages: Math.ceil(total / (query.limit || 20))
      }
    };
  }

  async getConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId,
            isActive: true
          }
        }
      },
      include: {
        participants: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profilePhoto: true,
                client: {
                  select: { fullName: true }
                },
                employee: {
                  select: { name: true }
                }
              }
            }
          }
        },
        task: {
          select: { id: true, title: true }
        },
        campaign: {
          select: { id: true, name: true }
        }
      }
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found or access denied');
    }

    return conversation;
  }

  async updateConversation(conversationId: string, updateDto: UpdateConversationDto, userId: string) {
    // Verificar se o usuário tem permissão (deve ser admin da conversa)
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        role: ParticipantRole.ADMIN,
        isActive: true
      }
    });

    if (!participant) {
      throw new ForbiddenException('Only conversation admins can update the conversation');
    }

    const conversation = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: updateDto,
      include: {
        participants: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profilePhoto: true,
                client: { select: { fullName: true } },
                employee: { select: { name: true } }
              }
            }
          }
        }
      }
    });

    return conversation;
  }

  async addParticipant(conversationId: string, addDto: AddParticipantDto, userId: string) {
    // Verificar se o usuário tem permissão
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        role: ParticipantRole.ADMIN,
        isActive: true
      }
    });

    if (!participant) {
      throw new ForbiddenException('Only conversation admins can add participants');
    }

    // Verificar se a conversa é de grupo
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (conversation?.type === ConversationType.INDIVIDUAL) {
      throw new BadRequestException('Cannot add participants to individual conversations');
    }

    // Verificar se o usuário já é participante
    const existingParticipant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: addDto.userId
        }
      }
    });

    if (existingParticipant && existingParticipant.isActive) {
      throw new BadRequestException('User is already a participant in this conversation');
    }

    // Adicionar ou reativar participante
    const newParticipant = await this.prisma.conversationParticipant.upsert({
      where: {
        conversationId_userId: {
          conversationId,
          userId: addDto.userId
        }
      },
      update: {
        isActive: true,
        role: addDto.role || ParticipantRole.MEMBER,
        joinedAt: new Date()
      },
      create: {
        conversationId,
        userId: addDto.userId,
        role: addDto.role || ParticipantRole.MEMBER
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profilePhoto: true,
            client: { select: { fullName: true } },
            employee: { select: { name: true } }
          }
        }
      }
    });

    // Notificar via WebSocket
    // TODO: Add WebSocket notification for participant added

    return newParticipant;
  }

  async removeParticipant(conversationId: string, participantId: string, userId: string) {
    // Verificar se o usuário tem permissão
    const requesterParticipant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        role: ParticipantRole.ADMIN,
        isActive: true
      }
    });

    if (!requesterParticipant) {
      throw new ForbiddenException('Only conversation admins can remove participants');
    }

    // Não permitir remoção do próprio criador
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (conversation?.createdBy === participantId) {
      throw new BadRequestException('Cannot remove the conversation creator');
    }

    // Remover participante (marcar como inativo)
    await this.prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: participantId
        }
      },
      data: { isActive: false }
    });

    // Notificar via WebSocket
    // TODO: Add WebSocket notification for participant removed

    return { message: 'Participant removed successfully' };
  }

  // =============== MESSAGES ===============

  async sendMessage(conversationId: string, createDto: CreateMessageDto, senderId: string) {
    // Verificar se o usuário é participante da conversa
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: senderId,
        isActive: true
      }
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    // Criar mensagem
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: createDto.content,
        messageType: createDto.messageType,
        fileUrl: createDto.fileUrl,
        fileName: createDto.fileName,
        fileSize: createDto.fileSize,
        mimeType: createDto.mimeType,
        replyToId: createDto.replyToId
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            profilePhoto: true,
            client: { select: { fullName: true } },
            employee: { select: { name: true } }
          }
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            messageType: true,
            sender: {
              select: {
                id: true,
                email: true,
                client: { select: { fullName: true } },
                employee: { select: { name: true } }
              }
            }
          }
        }
      }
    });

    // Atualizar timestamp da última mensagem na conversa
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    });

    return message;
  }

  async getMessages(conversationId: string, userId: string, query: QueryMessagesDto) {
    // Verificar se o usuário é participante
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        isActive: true
      }
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    const skip = ((query.page || 1) - 1) * (query.limit || 20);

    const whereConditions: any = {
      conversationId,
      isDeleted: false
    };

    if (query.before) {
      whereConditions.createdAt = { ...whereConditions.createdAt, lt: new Date(query.before) };
    }

    if (query.after) {
      whereConditions.createdAt = { ...whereConditions.createdAt, gt: new Date(query.after) };
    }

    if (query.messageType) {
      whereConditions.messageType = query.messageType;
    }

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: whereConditions,
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              profilePhoto: true,
              client: { select: { fullName: true } },
              employee: { select: { name: true } }
            }
          },
          replyTo: {
            select: {
              id: true,
              content: true,
              messageType: true,
              sender: {
                select: {
                  id: true,
                  email: true,
                  client: { select: { fullName: true } },
                  employee: { select: { name: true } }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit
      }),
      this.prisma.message.count({
        where: whereConditions
      })
    ]);

    return {
      messages: messages.reverse(), // Reverter para ordem cronológica
      pagination: {
        page: query.page || 1,
        limit: query.limit || 20,
        total,
        totalPages: Math.ceil(total / (query.limit || 20))
      }
    };
  }

  async updateMessage(messageId: string, updateDto: UpdateMessageDto, userId: string) {
    // Verificar se a mensagem pertence ao usuário
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: userId,
        isDeleted: false
      }
    });

    if (!message) {
      throw new NotFoundException('Message not found or access denied');
    }

    const updatedMessage = await this.prisma.message.update({
      where: { id: messageId },
      data: {
        content: updateDto.content,
        editedAt: new Date()
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            profilePhoto: true,
            client: { select: { fullName: true } },
            employee: { select: { name: true } }
          }
        }
      }
    });

    return updatedMessage;
  }

  async deleteMessage(messageId: string, userId: string) {
    // Verificar se a mensagem pertence ao usuário
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: userId,
        isDeleted: false
      }
    });

    if (!message) {
      throw new NotFoundException('Message not found or access denied');
    }

    await this.prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true }
    });

    return { message: 'Message deleted successfully' };
  }

  async markAsRead(conversationId: string, userId: string) {
    // Verificar se o usuário é participante
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        isActive: true
      }
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    // Atualizar timestamp de última leitura
    await this.prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      },
      data: { lastReadAt: new Date() }
    });

    return { message: 'Conversation marked as read' };
  }

  async getUnreadCount(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
            isActive: true
          }
        }
      },
      include: {
        participants: {
          where: { userId }
        },
        messages: {
          where: {
            senderId: { not: userId },
            isDeleted: false
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    let totalUnread = 0;
    const unreadByConversation: Array<{ conversationId: string; unreadCount: number }> = [];

    for (const conversation of conversations) {
      const participant = conversation.participants[0];
      const lastMessage = conversation.messages[0];

      if (lastMessage && participant?.lastReadAt && lastMessage.createdAt > participant.lastReadAt) {
        const unreadCount = await this.prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: { not: userId },
            isDeleted: false,
            createdAt: {
              gt: participant.lastReadAt
            }
          }
        });

        totalUnread += unreadCount;
        unreadByConversation.push({
          conversationId: conversation.id,
          unreadCount
        });
      }
    }

    return {
      totalUnread,
      conversations: unreadByConversation
    };
  }
}