import { requireDriver } from "./authService";
import { getAttendanceByDate } from "./attendanceService";

import {
  getAllUsers
} from "../repositories/userRepository";

export async function getPassengersByDate(
  driverId: string,
  date: string
) {
  await requireDriver(driverId);

  const attendances =
    await getAttendanceByDate(date);

  const users =
    await getAllUsers();

  return attendances.map(attendance => {

    const user =
      users.find(
        u => u.uid === attendance.studentId
      );

    return {
      studentId: attendance.studentId,
      name: user?.name,
      email: user?.email,
      date: attendance.date,
      going: attendance.going,
      returning: attendance.returning
    };

  });

}