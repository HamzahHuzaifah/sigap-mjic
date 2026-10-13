"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAttendance = void 0;
const db_1 = require("../lib/db");
const createAttendance = async (req, res) => {
    try {
        const { date, status, studentId } = req.body;
        if (!date || !status || !studentId) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        const attendanceDate = new Date(date);
        const result = await (0, db_1.query)('INSERT INTO Attendance (date, status, studentId, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE status = VALUES(status), updatedAt = NOW()', [attendanceDate, status, parseInt(studentId, 10)]);
        res.status(201).json({
            id: result.insertId,
            date: attendanceDate,
            status,
            studentId: parseInt(studentId, 10),
        });
    }
    catch (error) {
        console.error('Error creating attendance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createAttendance = createAttendance;
