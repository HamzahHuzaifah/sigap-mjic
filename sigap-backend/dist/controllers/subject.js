"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSubjects = void 0;
const db_1 = require("../lib/db");
const getAllSubjects = async (req, res) => {
    try {
        const subjects = await (0, db_1.query)('SELECT * FROM Subject ORDER BY name ASC');
        res.status(200).json(subjects);
    }
    catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAllSubjects = getAllSubjects;
