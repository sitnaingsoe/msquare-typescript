import express, {Request, Response} from "express";
import bcrypt from "bcryptjs";
import bodyParser from "body-parser";
import fs from "fs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import {checkAuth} from "./auth";

const PORT = 8888;

const server = express();

server.use(express.static("public"));
server.use(bodyParser.urlencoded({extended: true}));
server.use(cookieParser());
let users: {email: string; password: string}[] = [];

try {
  const existData = fs.readFileSync("./data/users.json", "utf-8");
  users = JSON.parse(existData);
} catch (error) {
  users = [];
}
server.post("/signup", (req: Request, res: Response) => {
  const {email, password} = req.body;

  if (!email && !password) {
    return res.status(400).send("Email and password are required");
  }
  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(password, salt);
  const newUser = {email: email, password: hashPassword};
  users.push(newUser);

  fs.writeFileSync("./data/users.json", JSON.stringify(users, null, 2));
  res.redirect("/signin.html");
});

server.post("/signin", (req: Request, res: Response) => {
  const {email, password} = req.body;
  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  const user = users.find((user) => user.email === email);

  if (!user) {
    return res.status(401).redirect("/signin.html");
  }
  const passwordMatch = bcrypt.compareSync(password, user.password);

  if (!passwordMatch) {
    return res.status(401).redirect("/signin.html");
  }

  const token = jwt.sign({email}, "icqR8iVR6ukggB", {expiresIn: "1h"});
  res.cookie("token", token);
  res.redirect("/index.html");
});
server.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/signin.html");
});
server.get("/data", checkAuth, (req, res) => {
  console.log("User Data",__dirname)
  res.sendFile(__dirname + "/data/users.json");
});

server.get("/about", checkAuth, (req, res) => {
  res.send("This is your about page");
});
server.listen(PORT, () => console.log(`Server has started listening on ${PORT}`));
