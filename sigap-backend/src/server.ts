import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import routes from './routes';

const app: Express = express();
const port = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', routes);

// Serve Frontend (React SPA)
const candidateDirs = [
  path.resolve(__dirname, '../public'),
  path.resolve(__dirname, '../../sigap-frontend/dist'),
  path.resolve(process.cwd(), 'public'),
  path.resolve(process.cwd(), '../sigap-frontend/dist'),
];

let frontendDist = '';
for (const dir of candidateDirs) {
  if (fs.existsSync(path.join(dir, 'index.html'))) {
    frontendDist = dir;
    break;
  }
}

if (frontendDist) {
  console.log(`[frontend]: Serving frontend from ${frontendDist}`);
  app.use(express.static(frontendDist));
  
  // Express 5 compatible SPA fallback
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(frontendDist, 'index.html'));
    }
    next();
  });
} else {
  app.get('/', (req, res) => {
    res.status(404).send(`SIGAP Backend is running. Frontend build not found in: ${candidateDirs.join(', ')}`);
  });
}

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
