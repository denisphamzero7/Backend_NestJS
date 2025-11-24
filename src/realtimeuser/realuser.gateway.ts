import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { RealtimeuserDocument } from './schemas/realtimeuser.schema'; // Import document schema

// Khai báo lại kiểu UserActionInfo (hoặc import nếu nó ở file khác)
interface UserActionInfo {
    _id: string;
    email: string;
}

// Kiểu dữ liệu đơn giản hơn, chỉ cần các trường cần thiết để thông báo
interface IBaseRealtimeUserPayload {
    _id: string; // ID của tài liệu bị ảnh hưởng
    executor: UserActionInfo; // Thông tin người thực hiện
}

@WebSocketGateway({
    namespace: 'realtimeuser', // Namespace riêng biệt
    cors: { origin: '*' },
})
export class RealtimeUserNotificationsGateway { // Đổi tên cho rõ ràng hơn
    @WebSocketServer()
    server: Server;

    // constructor() {} // Không cần inject RealtimeuserService nữa

    // Phương thức gửi thông báo khi tạo mới User
    notifyUserCreated(newUser: RealtimeuserDocument, executor: UserActionInfo) {
        console.log(`[RealtimeUser Gateway] User created: ${newUser._id}`);
        // Gửi toàn bộ đối tượng User mới tới tất cả clients
        this.server.emit('user_created', {
            data: newUser,
            message: `User ${newUser.email} đã được tạo bởi ${executor.email}`,
        });
    }

    // Phương thức gửi thông báo khi cập nhật User
    notifyUserUpdated(updatedUser: RealtimeuserDocument, executor: UserActionInfo) {
        console.log(`[RealtimeUser Gateway] User updated: ${updatedUser._id}`);
        // Gửi toàn bộ đối tượng User đã cập nhật tới tất cả clients
        this.server.emit('user_updated', {
            data: updatedUser,
            message: `User ${updatedUser.email} đã được cập nhật bởi ${executor.email}`,
        });
    }

    // Phương thức gửi thông báo khi xóa mềm User
    notifyUserDeleted(userId: string, executor: UserActionInfo) {
        console.log(`[RealtimeUser Gateway] User deleted (soft): ${userId}`);
        // Chỉ cần gửi ID của User bị xóa và thông tin người thực hiện
        this.server.emit('user_deleted', {
            _id: userId,
            message: `User có ID ${userId} đã bị xóa mềm bởi ${executor.email}`,
        });
    }

    // Bạn có thể giữ lại handleConnection/handleDisconnect đơn giản nếu cần theo dõi client
    // Nhưng không xử lý logic CRUD hay gửi dữ liệu ban đầu ở đây nữa.
    // Nếu bạn muốn gửi danh sách ban đầu, hãy gọi qua API REST hoặc tạo một sự kiện socket riêng.

    // handleConnection(client: Socket) {
    //     console.log(`[RealtimeUser Gateway] Client connected: ${client.id}`);
    //     // Không cần làm gì thêm, client sẽ tự gọi API để lấy dữ liệu.
    // }

    // handleDisconnect(client: Socket) {
    //     console.log(`[RealtimeUser Gateway] Client disconnected: ${client.id}`);
    // }
}