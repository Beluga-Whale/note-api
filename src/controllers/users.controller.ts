import { RequestHandler } from "express";
import createHttpError from "http-errors";
import userModel from "../models/user.model";
import bcrypt from "bcrypt";

export const getAuthenticatedUser: RequestHandler = async (req, res, next) => {
  const authenticatedUser = req.session.userId;

  try {
    if (!authenticatedUser) {
      throw createHttpError(401, "User not authenticated");
    }
    const user = await userModel
      .findById(authenticatedUser)
      .select("email")
      .exec();

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

interface SignupBody {
  username?: string;
  email?: string;
  password?: string;
}

export const signUp: RequestHandler<
  unknown,
  unknown,
  SignupBody,
  unknown
> = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      throw createHttpError(400, "Parameter missing");
    }

    const existingUsername = await userModel.findOne({ username }).exec();

    if (existingUsername) {
      throw createHttpError(
        409,
        "Username already taken. Please choose a diffrent one or log in instead"
      );
    }

    const existingEmail = await userModel.findOne({ email }).exec();
    if (existingEmail) {
      throw createHttpError(
        409,
        "A user with this eamil address already exists. Please log in instead"
      );
    }

    const passwordHashed = bcrypt.hashSync(password, 10);

    const newUser = await userModel.create({
      username,
      email,
      password: passwordHashed,
    });

    req.session.userId = newUser._id;

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

interface LoginBody {
  username?: string;
  password?: string;
}

export const login: RequestHandler<
  unknown,
  unknown,
  LoginBody,
  unknown
> = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      throw createHttpError(400, "Parameters missing");
    }
    const user = await userModel
      .findOne({ username })
      .select("+password +email") //เลือกดึง passwword , email เพื่อนำไป compare เพราะ model user password ตั้งค่า select ไว้เป็น false
      .exec();

    if (!user || !user.password) {
      throw createHttpError(401, "Invalid credentials");
    }

    const passwordCheck = bcrypt.compare(password, user?.password);
    if (!passwordCheck) {
      throw createHttpError(401, "Invalid credentials");
    }

    req.session.userId = user._id;
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = async (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(200);
    }
  });
};
