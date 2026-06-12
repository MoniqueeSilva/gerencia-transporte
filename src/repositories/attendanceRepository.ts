import {
  addDoc,
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";

import { db } from "../firebase/firestore";
import { Attendance } from "../models/Attendance";

const attendanceCollection =
  collection(db, "attendance");

export async function createAttendance(
  attendance: Attendance
) {
  return addDoc(
    attendanceCollection,
    attendance
  );
}

export async function findAttendanceByStudent(
  studentId: string
) {

  const q = query(
    attendanceCollection,
    where("studentId", "==", studentId)
  );

  const snapshot =
    await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function findAttendanceByStudentAndDate(
  studentId: string,
  date: string
) {

  const q = query(
    attendanceCollection,
    where("studentId", "==", studentId),
    where("date", "==", date)
  );

  const snapshot =
    await getDocs(q);

  return snapshot.docs;
}

export async function findAttendanceByDate(
  date: string
) {

  const q = query(
    attendanceCollection,
    where("date", "==", date)
  );

  const snapshot =
    await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}