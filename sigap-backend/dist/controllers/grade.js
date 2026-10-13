"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGrade = void 0;
const prisma_1 = require("../lib/prisma");
const createGrade = async (req, res) => {
    try {
        const { score, type, studentId, subjectId } = req.body;
        if (score === undefined || !type || !studentId || !subjectId) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        const newGrade = await prisma_1.prisma.grade.create({
            data: {
                score,
                type,
                studentId,
                subjectId,
            },
        });
        res.status(201).json(newGrade);
    }
    catch (error) {
        console.error('Error creating grade:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createGrade = createGrade;
