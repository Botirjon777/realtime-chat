export interface AdminStats {
  totalRooms: number;
  activeRooms: number;
  avgRating: number;
  totalFeedbacks: number;
  totalMessages?: number;
}

export interface VolumeDataPoint {
  time: string;
  count: number;
}
