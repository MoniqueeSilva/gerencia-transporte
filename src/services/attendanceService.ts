import {
  createAttendance,
  findAttendanceByStudent,
  findAttendanceByStudentAndDate,
  findAttendanceByDate
} from "../repositories/attendanceRepository";

import { Attendance } from "../models/Attendance";

export async function confirmAttendance(
  attendance: Attendance
) {
  if (!attendance.studentId) {
    throw new Error("Aluno inválido");
  }

  if (!attendance.date) {
    throw new Error("Data obrigatória");
  }

  const existing =
    await findAttendanceByStudentAndDate(
      attendance.studentId,
      attendance.date
    );

  if (existing.length > 0) {
    throw new Error(
      "Presença já confirmada para hoje"
    );
  }

  return await createAttendance(attendance);
}

export async function getStudentAttendance(
  studentId: string
) {
  return await findAttendanceByStudent(studentId);
}

export async function getAttendanceByDate(
  date: string
) {
  return await findAttendanceByDate(date);
}