import "dotenv/config";
import env from "./util/validateEnv";
import mongoose from "mongoose";
import express, { NextFunction, Request, Response } from "express";
import notesRoutes from "./routes/note.route";
import userRoutes from "./routes/user.route";
import morgan from "morgan";
import createHttpError, { isHttpError } from "http-errors";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";

const app = express();
const port = env.PORT;

const corsOptions = {
  origin: "http://localhost:5173", // Vite dev server
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(morgan("dev"));

app.use(express.json());

app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000,
    },
    rolling: true,
    store: MongoStore.create({
      mongoUrl: env.MONGO_URI,
    }),
  })
);

app.use("/api/users", userRoutes);
app.use("/api/notes", notesRoutes);

app.use((rqe, res, next) => {
  next(createHttpError(404, "Enpoint not found!"));
});

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  let errorMessage = "An unknow error occurred";
  let statusCode = 500;
  if (isHttpError(error)) {
    statusCode = error.status;
    errorMessage = error.message;
  }
  res.status(statusCode).json({ error: errorMessage });
});

mongoose
  .connect(env.MONGO_URI)
  .then(() => {
    console.log("Mongoose connected");
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
