"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.set('trust proxy', 1);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API routes
app.use('/api', routes_1.default);
// Serve Frontend (React SPA)
const candidateDirs = [
    path_1.default.resolve(__dirname, '../public'),
    path_1.default.resolve(__dirname, '../../sigap-frontend/dist'),
    path_1.default.resolve(process.cwd(), 'public'),
    path_1.default.resolve(process.cwd(), '../sigap-frontend/dist'),
];
let frontendDist = '';
for (const dir of candidateDirs) {
    if (fs_1.default.existsSync(path_1.default.join(dir, 'index.html'))) {
        frontendDist = dir;
        break;
    }
}
if (frontendDist) {
    console.log(`[frontend]: Serving frontend from ${frontendDist}`);
    app.use(express_1.default.static(frontendDist));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
            return next();
        }
        res.sendFile(path_1.default.join(frontendDist, 'index.html'));
    });
}
else {
    app.get('/', (req, res) => {
        res.status(404).send(`SIGAP Backend is running. Frontend build not found in: ${candidateDirs.join(', ')}`);
    });
}
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
