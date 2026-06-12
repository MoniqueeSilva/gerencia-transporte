export interface Attendance {
  id?: string;
  studentId: string;
  date: string;
  going: boolean;
  returning: boolean;
  createdAt: Date;
}