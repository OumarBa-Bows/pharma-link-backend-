require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const fileupload = require("express-fileupload");

const { prisma, connect: connectPrisma } = require("./configs/prisma.conf");

const routes = require("./routes/");

const app = express();
const server = http.Server(app);

app.use(cors());
app.use(fileupload());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Setup routes.
app.use(routes({ app, prisma }));

(async function () {
  await connectPrisma(); // Prisma connecté ici
})().then(() => {
  server.listen(process.env.APP_PORT, () => {
    console.info(`🚀 Server running on port: ${process.env.APP_PORT}`);
  });
});

function _gracefulShutdown(exit = false) {
  console.warn("Received SIGINT or SIGTERM. Shutting down gracefully...");
  const exitCode = exit ? 1 : 0;

  server.close(async () => {
    console.info("Closed out remaining connections.");
    await prisma.$disconnect(); // Déconnexion Prisma propre
    process.exit(exitCode);
  });

  // Force stop après 5 sec
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(exitCode);
  }, 5 * 1000);
}

process.on("unhandledRejection", (reason, p) => {
  console.error(reason, "Unhandled Rejection at Promise", p);
});

process.on("uncaughtException", (err) => {
  console.error(err, "Uncaught Exception thrown");
  _gracefulShutdown(true);
});
