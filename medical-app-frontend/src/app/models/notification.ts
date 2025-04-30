// src/app/models/notification.ts
export interface Notification {
    id: number;
    userId: number;
    message: string;
    createdAt: string;
    isRead: boolean;
  }