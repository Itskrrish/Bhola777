import express from "express";
import auth from "../config/auth.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

import { throwError, throwIf } from "../utilities/request.handler.js";

export const checkLoggedIn = async (req, res, next) => {
  const token = req.cookies.uid;

  if (!Boolean(token)) {
    return res.status(401).json({ message: "Not Authorized", login: false, error: false, success: true });
  }

  jwt.verify(token, auth(process.env).jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized", message: "Invalid token" });
    }

    // If the token is valid, attach the decoded user information to the request object
    req.userId = decoded._id;
    // console.log(decoded.id);
   
    next(); // Call next to pass control to the next middleware or route handler
  });
};


// export const checkLoggedIn = async (req, res, next) => {
 
//   const userUid =  req.cookies.uid
//   console.log(userUid);
//  if (!Boolean(userUid)) return res.status(401).json({mesage:"Not AUthorised",login:false,error:false,success:true})
//   const user= getuser( String(userUid) );
//  console.log(user);
//  if(!user) 
//  { 
//    console.log(user);
//    return res.redirect("/login");
// }

//  // req.user=user;

//  next();


// }
