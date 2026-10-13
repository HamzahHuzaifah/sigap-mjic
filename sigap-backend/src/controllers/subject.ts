import { Request, Response } from 'express';
import { query } from '../lib/db';

export const getAllSubjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const subjects = await query('SELECT * FROM Subject ORDER BY name ASC');
    res.status(200).json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
