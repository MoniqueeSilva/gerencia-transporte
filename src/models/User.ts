export interface User {
  uid: string;
  name: string;
  email: string;
  role: "student" | "driver";
  createdAt: Date;
}