const express = require("express");
const router = express.Router();
const Post = require("../model/Post");
const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminLayout = "./layouts/admin";

const jwtSecret = process.env.JWT_SECRET;

/**
 * check login
 * middleware
 */
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

/**
 * GET/
 * Admin - Login page
 */
router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "New Management System Project",
    };
    res.render("admin/index", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

/**
 * POST/
 * Admin - Login
 */
router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    // console.log(req.body);
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(409).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userID: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {}
});

/**
 * GET/
 * Admin Dashboard
 */
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Dashboard",
      description: "Admin Panel for News Management System",
    };
    const data = await Post.find();
    res.render("admin/dashboard", { locals, data, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

/**
 * GET/
 * Admin - Create new post
 */
router.get("/add-post", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      description: "Adding a new post",
    };
    res.render("admin/add-post", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

/**
 * POST/
 * Admin - Add new post
 */
router.post("/add-post", authMiddleware, async (req, res) => {
  try {
    // console.log(req.body);
    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body,
      });
      await Post.create(newPost);
      res.redirect("/dashboard");
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
});

/**
 * POST/
 * Admin - login sample
 */
// router.post("/admin", async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     // console.log(req.body);
//     if (req.body.username === "admin" && req.body.password === "pass") {
//       res.send("You are logged in.");
//     } else {
//       res.send("Wrong Username or Password.");
//     }
//   } catch (error) {}
// });

/**
 * POST/
 * Admin - Redister
 */
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const user = await User.create({ username, password: hashedPassword });
      res.status(201).json({ message: "User Created", user });
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).json({ message: "User already in use" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;
