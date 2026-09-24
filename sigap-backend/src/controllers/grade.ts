import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const createGrade = async (req: Request, res: Response): Promise<void> => {
  try {
    const { score, type, studentId, subjectId } = req.body;

    if (score === undefined || !type || !studentId || !subjectId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const newGrade = await prisma.grade.create({
      data: {
        score,
        type,
        studentId,
        subjectId,
      },
    });

    res.status(201).json(newGrade);
  } catch (error) {
    console.error('Error creating grade:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
