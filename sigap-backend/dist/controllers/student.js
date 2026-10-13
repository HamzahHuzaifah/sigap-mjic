"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentSummary = exports.getAllStudents = void 0;
const db_1 = require("../lib/db");
const getAllStudents = async (req, res) => {
    try {
        const students = await (0, db_1.query)('SELECT * FROM Student ORDER BY name ASC');
        res.status(200).json(students);
    }
    catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAllStudents = getAllStudents;
const getStudentSummary = async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = parseInt(id, 10);
        const students = await (0, db_1.query)('SELECT * FROM Student WHERE id = ? LIMIT 1', [studentId]);
        const student = students[0];
        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        // Fetch attendances
        const attendances = await (0, db_1.query)('SELECT * FROM Attendance WHERE studentId = ? ORDER BY date DESC', [studentId]);
        // Fetch grades with joined subject
        const rawGrades = await (0, db_1.query)(`
      SELECT g.id, g.score, g.type, g.studentId, g.subjectId, g.createdAt, g.updatedAt,
             s.name as subjectName
      FROM Grade g
      JOIN Subject s ON g.subjectId = s.id
      WHERE g.studentId = ?
    `, [studentId]);
        const formattedGrades = rawGrades.map((g) => ({
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
    }
    catch (error) {
        console.error('Error fetching student summary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getStudentSummary = getStudentSummary;
