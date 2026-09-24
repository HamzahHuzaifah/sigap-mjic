import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getAllSubjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: 'asc' }
    });
    res.status(200).json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
