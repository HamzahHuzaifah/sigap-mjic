"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSubjects = void 0;
const prisma_1 = require("../lib/prisma");
const getAllSubjects = async (req, res) => {
    try {
        const subjects = await prisma_1.prisma.subject.findMany({
            orderBy: { name: 'asc' }
        });
        res.status(200).json(subjects);
    }
    catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAllSubjects = getAllSubjects;
