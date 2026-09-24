import { Router } from 'express';
import { createGrade } from '../controllers/grade';
import { createAttendance } from '../controllers/attendance';
import { getStudentSummary, getAllStudents } from '../controllers/student';
import { getAllSubjects } from '../controllers/subject';
import { login } from '../controllers/auth';

const router = Router();

router.post('/login', login);
router.get('/students', getAllStudents);
router.get('/subjects', getAllSubjects);
router.post('/grades', createGrade);
router.post('/attendances', createAttendance);
router.get('/students/:id/summary', getStudentSummary);

export default router;
