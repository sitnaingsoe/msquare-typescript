import express, {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  console.log("Your taken", token);
  if (!token) {
    return res.status(401).redirect("/signin.html");
  } else {
    console.log("You already arrived in this here");
    jwt.verify(token, "icqR8iVR6ukggB", (err) => {
      if (err) {
        return res.status(400).send("unauthorized");
      }
      next();
    });
  }
};
