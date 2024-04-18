import express from "express";
import Odd from "../../../../models/Odd.js";
import { checkLoggedIn } from "../../../../middlewares/auth.js";
import {
  signUp,
  signIn,
  USER_TYPES,
  register,login_admin
} from "../../../../controller/AuthController.js";

import { sendmessage,loadchats } from "../../../../controller/MessageController.js";
import { allusers,userchates,sendadminmessgae,loadadminchats } from "../../../../controller/AdminController.js";
const hashmap=new Map();
const router = express.Router();

router.get("/", (req, res) => {
  res.render("home");
});

router.get("/get-odds", async (req, res) => {
  try {
    const allodds = await Odd.find();
    res.json({ success: true, error: false, odds: allodds });
  } catch (err) {
    res.json({ success: false, error: true, fail: err });
  }
});
// router.get("/map-test",() => {
//   hashmap.set("test_key","test_value");
//   console.log(hashmap.get("test_key"));
// });
router.post("/sign-in", signUp);
router.post("/sign-up", register);
router.get('/load-chats',loadchats);
router.get("/admin", (req, res) => {
  res.render("admin/index");
});

router.get("/admin/all-users", allusers);
router.get("/admin/create-user", (req,res) =>{
  res.render('admin/users/create');
});
router.get("/admin/user-chat",userchates);
router.get('/admin/load-chats',loadadminchats);


router.get("/login", (req, res) => {
  res.render("login_page");
});
router.post("/admin/login-request",login_admin);
router.get("/register", (req, res) => {
  res.render("register_page");
  
});
router.get("/admin/user/:userId",(req,res) => {
  res.render('admin/chat/chat_box');
});

router.get("/admin/login",(req,res) =>{
  res.render('admin_login');
})

router.post("/send-message", sendmessage);
router.get('/active-chat',userchates);
router.post("/admin/send-message",sendadminmessgae);
// router.get("/last-message",lastmessage);

router.get("/test-t", checkLoggedIn );
// @route   GET api/auth/login
// @desc    Login User and return JWT token
// @access  Public

export default router;
