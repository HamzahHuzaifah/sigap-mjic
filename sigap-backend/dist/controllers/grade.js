"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGrade = void 0;
const db_1 = require("../lib/db");
const createGrade = async (req, res) => {
    try {
        const { score, type, studentId, subjectId } = req.body;
        if (score === undefined || !type || !studentId || !subjectId) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        const result = await (0, db_1.query)('INSERT INTO Grade (score, type, studentId, subjectId, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())', [parseFloat(score), type, parseInt(studentId, 10), parseInt(subjectId, 10)]);
        res.status(201).json({
            id: result.insertId,
            score: parseFloat(score),
            type,
            studentId: parseInt(studentId, 10),
            subjectId: parseInt(subjectId, 10),
        });
    }
    catch (error) {
        console.error('Error creating grade:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createGrade = createGrade;
