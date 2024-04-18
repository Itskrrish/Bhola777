import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import auth from "../config/auth.js";
import User from "../models/User.js";
import { throwError, throwIf  } from "../utilities/request.handler.js";
import {v4} from "uuid";

export const USER_TYPES = { ADMIN: 1, USER: 2 }; // User types are defined as integers for easy comparison.
// A user is either an admin or a regular user (user).

const sessionidtousermap = new Map();

function setUser(id,user){
  sessionidtousermap.set(String(id),user);
}

export function getuser(id){
  return sessionidtousermap.get(id);
}

export const signUp = async (req,res)  =>{
  const { phone, password } = req.body; 
  console.log(password);
 
 
  if (!Boolean(phone)) {
    return res.status(200).json({ success: false, error: true, message: "Phone Number Required" });
  }
  if (!Boolean(password)) {
    return res.status(200).json({ success: false, error: true, message: "Password  Required" });
  }

  try {
    let user = await User.findOne({ phone: phone });
    if (!user) {
      return res.status(200).json({ success: false, error: true, message: "User not found" });
    }

    const match = await comparePasswords(password, user.password);
    if (match) {
      const payload = { id: user._id, token: user.phone };
      const jwt_token = jwt.sign(payload, auth(process.env).jwtSecret, {
        expiresIn: auth(process.env).jwtExpiresIn,
        algorithm: auth(process.env).jwtAlgorithm,
      });

      // if(!Boolean(user.is_admin))    return res.status(400).json({ success: false, error: true, message: "User not Authorised" });
      res.cookie("uid", jwt_token);
      
      return res.status(200).json({
        success: true,
        message: "Login successful",
        redirectUrl: `/`,
      });
    } else {
      return res.status(200).json({ success: false, error: true, message: "Password is wrong" });
    }
  } catch (error) {
    console.error('Error in signUp:', error);
    return res.status(500).json({ success: false, error: true, message: "Something went wrong" });
  }
};

export const signIn = async (req,res) => {
  const { phone, password } = req.body;
  let user = await User.findOne({ phone: phone });
  if (!user) throwError("400", "Sign in Failed", "Invalid Phone number")();
  await bcrypt.compare(String(password), String(user.password)).then(
    throwIf(
      (r) => !r,
      400,
      "Authentication failed",
      "failed to login bad credentials"
    ),
    throwError(500, "Bcrypt Error")
  );
    }


  export const register = async (req,res) => {
   try{
    const {phone ,password} = req.body;
    if (!Boolean(phone)) return res.status(200).json({success:false,message:"phone number is required"});
    if (!Boolean(password)) return res.status(200).json({success:false,message:"password is required"});
    
    let user = await User.findOne({ phone: phone });
    if (user)  return res.status(200).json({message :"Phone Number Exists",error:false,success:true});

    const hashedPassword = await bcrypt.hash(String(password), auth(process.env).saltRounds);
    
    user = await User.create({
      phone,
      password: hashedPassword,
      user_type: USER_TYPES.USER,
    });

 return res.status(200).json({
    success: true,
    message: "User Created successful",
    redirectUrl: `/admin/all-users`,
  });
}
catch(e){
  console.log(e);
  return res.status(500).json({ success: false, error: true, message: "Something went wrong" });
}
 };

 
 





 function comparePasswords(inputPassword, hashedPassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(String(inputPassword), String(hashedPassword), function(err, result) {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
}


export const login_admin = async (req,res)  =>{
  const { phone, password } = req.body; 
  console.log(password);
 
 
  if (!Boolean(phone)) {
    return res.status(200).json({ success: false, error: true, message: "Phone Number Required" });
  }
  if (!Boolean(password)) {
    return res.status(200).json({ success: false, error: true, message: "Password  Required" });
  }

  try {
    let user = await User.findOne({ phone: phone });
    if (!user) {
      return res.status(200).json({ success: false, error: true, message: "User not found" });
    }

    const match = await comparePasswords(password, user.password);
    if (match) {
      const payload = { id: user._id, token: user.phone };
      const jwt_token = jwt.sign(payload, auth(process.env).jwtSecret, {
        expiresIn: auth(process.env).jwtExpiresIn,
        algorithm: auth(process.env).jwtAlgorithm,
      });

      // if(!Boolean(user.is_admin))    return res.status(400).json({ success: false, error: true, message: "User not Authorised" });
      res.cookie("uid", jwt_token);
      
      return res.status(200).json({
        success: true,
        message: "Login successful",
        redirectUrl: `/admin/`,
      });
    } else {
      return res.status(200).json({ success: false, error: true, message: "Password is wrong" });
    }
  } catch (error) {
    console.error('Error in signUp:', error);
    return res.status(500).json({ success: false, error: true, message: "Something went wrong" });
  }
};
  
   



 


