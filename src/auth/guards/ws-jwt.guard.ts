import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      
      // Extrair token do handshake auth ou query
      const token = this.extractTokenFromClient(client);
      
      if (!token) {
        this.logger.warn('No token provided for WebSocket connection');
        throw new WsException('Unauthorized');
      }

      // Verificar e decodificar token
      const payload = this.jwtService.verify(token);
      
      if (!payload.sub) {
        throw new WsException('Invalid token payload');
      }

      // Buscar usuário no banco
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw new WsException('User not found or inactive');
      }

      // Adicionar usuário ao socket
      (client as any).user = user;
      
      return true;
    } catch (error) {
      this.logger.error(`WebSocket authentication failed: ${error.message}`);
      throw new WsException('Unauthorized');
    }
  }

  private extractTokenFromClient(client: Socket): string | null {
    // Tentar extrair do auth header primeiro
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Tentar extrair do auth no handshake
    const auth = client.handshake.auth?.token;
    if (auth) {
      return auth;
    }

    // Tentar extrair da query string
    const queryToken = client.handshake.query?.token as string;
    if (queryToken) {
      return queryToken;
    }

    return null;
  }
}