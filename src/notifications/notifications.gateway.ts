import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';

// Định nghĩa cấu trúc cho các payload
interface INewApplicationPayload {
  jobTitle: string;
  candidateName: string;
  companyId: string;
}

interface IStatusUpdatePayload {
  jobTitle: string;
  status: string;
  userId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    // Giữ lại userModel để cập nhật trạng thái online/offline
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Xử lý khi một client kết nối tới server.
   */
  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    const companyId = client.handshake.query.companyId as string;

    if (!userId) {
      console.log(`[WebSocket] Connection rejected: Missing userId.`);
      return client.disconnect();
    }

    console.log(`[WebSocket] Client connected: ${client.id}, UserID: ${userId}`);

    // Thêm client vào các room cần thiết
    client.join(`user_${userId}`);
    if (companyId) {
      client.join(`company_${companyId}`);
    }

    // Xử lý trạng thái "online"
    const sockets = await this.server.in(`user_${userId}`).fetchSockets();
    if (sockets.length === 1) {
      await this.userModel.updateOne({ _id: userId }, { $set: { lastSeen: null } });
      this.server.emit('user_online', { userId });
    }
  }

  /**
   * Xử lý khi một client ngắt kết nối.
   */
  async handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) return;

    // Xử lý trạng thái "offline"
    const sockets = await this.server.in(`user_${userId}`).fetchSockets();
    if (sockets.length === 0) {
      const lastSeenTime = new Date();
      await this.userModel.updateOne(
        { _id: userId },
        { $set: { lastSeen: lastSeenTime } },
      );
      this.server.emit('user_offline', { userId, lastSeen: lastSeenTime });
    }
  }

  // --- Các phương thức gửi thông báo (không thay đổi) ---

  notifyNewApplication(payload: INewApplicationPayload) {
    this.server.to(`company_${payload.companyId}`).emit('new_application', {
      message: `Ứng viên ${payload.candidateName} vừa nộp hồ sơ cho công việc ${payload.jobTitle}`,
      data: payload,
    });
  }

  notifyStatusUpdate(payload: IStatusUpdatePayload) {
    this.server.to(`user_${payload.userId}`).emit('status_update', {
      message: `Hồ sơ của bạn cho công việc ${payload.jobTitle} đã được cập nhật thành: ${payload.status}`,
      data: payload,
    });
  }

  notifyCompanyOfCvUpdate(companyId: string, updatedCv: any) {
    this.server.to(`company_${companyId}`).emit('cv_updated', {
      message: `Một hồ sơ trong công ty vừa được cập nhật.`,
      data: updatedCv,
    });
  }
}