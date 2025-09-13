import 'dotenv/config';
import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import fileupload from 'express-fileupload';
import cookieParser from 'cookie-parser';

import { prisma, connect as connectPrisma } from './configs/prisma.conf';
import routes from './routes';

const app: Application = express();
const server = http.createServer(app);

const allowedOrigins: string[] = [
  'http://localhost:4200',
  'http://localhost',
  'http://127.0.0.1',
];

app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(fileupload());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Setup routes
app.use(routes({ app, prisma }));

(async function startServer() {
  await connectPrisma(); // Prisma connecté ici

  const port = Number(process.env.APP_PORT) || 3000;
  server.listen(port, () => {
    console.info(`🚀 Server running on port: ${port}`);
  });
})();

function gracefulShutdown(exit = false) {
  console.warn('Received SIGINT or SIGTERM. Shutting down gracefully...');
  const exitCode = exit ? 1 : 0;

  server.close(async () => {
    console.info('Closed out remaining connections.');
    await prisma.$disconnect(); // Déconnexion Prisma propre
    process.exit(exitCode);
  });

  // Force stop après 5 sec
  setTimeout(() => {
    console.error(
      'Could not close connections in time, forcefully shutting down'
    );
    process.exit(exitCode);
  }, 5 * 1000);
}

process.on('unhandledRejection', (reason: any, p: Promise<any>) => {
  console.error(reason, 'Unhandled Rejection at Promise', p);
});

process.on('uncaughtException', (err) => {
  console.error(err, 'Uncaught Exception thrown');
  gracefulShutdown(true);
});
