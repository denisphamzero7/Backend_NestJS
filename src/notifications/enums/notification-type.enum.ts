export enum NotificationType {
  SYSTEM = 'SYSTEM',             // Hệ thống
  VOTE_SUCCESS = 'VOTE_SUCCESS', // Bầu thành công
  VOTE_WARNING = 'VOTE_WARNING', // Cảnh báo đã bầu
  CREATE_VOTER = 'CREATE_VOTER', // Tạo cử tri
  UPDATE_VOTER = 'UPDATE_VOTER', // Cập nhật
  DELETE_VOTER = 'DELETE_VOTER', // Xóa
}