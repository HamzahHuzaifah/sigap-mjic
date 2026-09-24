import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getAllStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const students = await prisma.student.findMany({
      orderBy: { name: 'asc' }
    });
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStudentSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id: parseInt(id as string) },
      include: {
        attendances: true,
        grades: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    res.status(200).json(student);
  } catch (error) {
    console.error('Error fetching student summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
