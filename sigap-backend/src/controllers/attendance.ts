import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const createAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, status, studentId } = req.body;

    if (!date || !status || !studentId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const newAttendance = await prisma.attendance.create({
      data: {
        date: new Date(date),
        status,
        studentId,
      },
    });

    res.status(201).json(newAttendance);
  } catch (error) {
    console.error('Error creating attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
