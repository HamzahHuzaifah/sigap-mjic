import { Request, Response } from 'express';
import { query } from '../lib/db';

export const getAllStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const students = await query('SELECT * FROM Student ORDER BY name ASC');
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStudentSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const studentId = parseInt(id as string, 10);

    const students: any = await query('SELECT * FROM Student WHERE id = ? LIMIT 1', [studentId]);
    const student = students[0];

    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    // Fetch attendances
    const attendances = await query('SELECT * FROM Attendance WHERE studentId = ? ORDER BY date DESC', [studentId]);

    // Fetch grades with joined subject
    const rawGrades: any = await query(`
      SELECT g.id, g.score, g.type, g.studentId, g.subjectId, g.createdAt, g.updatedAt,
             s.name as subjectName
      FROM Grade g
      JOIN Subject s ON g.subjectId = s.id
      WHERE g.studentId = ?
    `, [studentId]);

    const formattedGrades = rawGrades.map((g: any) => ({
      id: g.id,
      score: g.score,
      type: g.type,
      studentId: g.studentId,
      subjectId: g.subjectId,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
      subject: {
        id: g.subjectId,
        name: g.subjectName,
      },
    }));

    res.status(200).json({
      ...student,
      attendances,
      grades: formattedGrades,
    });
  } catch (error) {
    console.error('Error fetching student summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
