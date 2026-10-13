"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentSummary = exports.getAllStudents = void 0;
const prisma_1 = require("../lib/prisma");
const getAllStudents = async (req, res) => {
    try {
        const students = await prisma_1.prisma.student.findMany({
            orderBy: { name: 'asc' }
        });
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
        const student = await prisma_1.prisma.student.findUnique({
            where: { id: parseInt(id) },
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
    }
    catch (error) {
        console.error('Error fetching student summary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getStudentSummary = getStudentSummary;
