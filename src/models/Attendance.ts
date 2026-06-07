export interface Attendance {
  id?: string;
  studentId: string;
  date: string;
  going: boolean;
  returning: boolean;
  shift: string;
  createdAt: Date;
}