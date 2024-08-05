import {
  getNotes,
  createNote,
  getNote,
  updateNote,
  deleteNote,
} from "../controllers/notes.controller";
import express from "express";

const router = express.Router();

router.get("/", getNotes);

router.get("/:noteId", getNote);

router.post("/", createNote);

router.post("/:noteId", updateNote);

router.delete("/:noteId", deleteNote);

export default router;
