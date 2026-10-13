"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAttendance = void 0;
const prisma_1 = require("../lib/prisma");
const createAttendance = async (req, res) => {
    try {
        const { date, status, studentId } = req.body;
        if (!date || !status || !studentId) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        const newAttendance = await prisma_1.prisma.attendance.create({
            data: {
                date: new Date(date),
                status,
                studentId,
            },
        });
        res.status(201).json(newAttendance);
    }
    catch (error) {
        console.error('Error creating attendance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createAttendance = createAttendance;
