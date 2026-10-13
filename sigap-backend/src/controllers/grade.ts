import { Request, Response } from 'express';
import { query } from '../lib/db';

export const createGrade = async (req: Request, res: Response): Promise<void> => {
  try {
    const { score, type, studentId, subjectId } = req.body;

    if (score === undefined || !type || !studentId || !subjectId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const result: any = await query(
      'INSERT INTO Grade (score, type, studentId, subjectId, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [parseFloat(score), type, parseInt(studentId, 10), parseInt(subjectId, 10)]
    );

    res.status(201).json({
      id: result.insertId,
      score: parseFloat(score),
      type,
      studentId: parseInt(studentId, 10),
      subjectId: parseInt(subjectId, 10),
    });
  } catch (error) {
    console.error('Error creating grade:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
