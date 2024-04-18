import express from "express";
import Message from "../models/Message.js";
import { io } from "../bin/standalone.js";
import jwt from "jsonwebtoken";
import auth  from "../config/auth.js";
import adminConfig from  "../config/admin.js";

export const sendmessage = async (req, res) => {
  const { body } = req.body;
  const sender_id = req.userId;
  const reciever_id = adminConfig().adminid; // hardcoded for testing purposes
  // console.log(req.body);
  try {
    const message = await Message.create({
      body,
      sender_id,
      reciever_id,
    });
    res.status(200).json({
      message: "message send successfully",
      error: false,
      status: true,
    });
  } catch (err) {
    console.log(err);
  }
};

export const initMessageListener = () => {
  try {
    Message.watch().on("change", async (change) => {
      if (change.operationType === "insert") {
        const newMessage = await Message.findById(change.fullDocument._id);
        io.emit("newMessage", newMessage);
      }
    });
  } catch (err) {
    console.log(err);
  }
};


 export async function getLatestMessage() {
  
  let currentMessageId=  await Message.findOne({}, {}, { sort: { created_at: -1 } }).id; //23
  console.log("Current <essage id:", currentMessageId);
  
  function LatestMessage() {
    setInterval( async () => {
    
      try {
        const count = await Message.countDocuments();

        if (count > 0) {
          let latestMessage = await Message.findOne({}, {}, { sort: { created_at: -1 } }); //24
          // console.log("Lates Message ID:",latestMessage);
          // console.log(Boolean(latestMessage.id !== currentMessageId));
          
          if (Boolean(latestMessage.id !== currentMessageId)) {
            currentMessageId = latestMessage.id;
            io.emit("newMessage", latestMessage);
            // console.log("newMessage event emitted with message:", latestMessage);
          } else {
            // console.log("No new messages.");
          }
        } else {
          console.log("No messages in the collection.");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }, 7);
  }

  // Return the getLatestMessage function from the parent function
  return LatestMessage;
}

export async function getLatestMessagefromadmin() {
  
  let currentMessageId=  await Message.findOne({sender_id :adminConfig().adminid }, {}, { sort: { created_at: -1 } }).id; //latest admin message
  console.log("Current <essage id of admin:", currentMessageId);
  
  function LatestMessagefromadmin() {
    setInterval( async () => {
    
      try {
        const count = await Message.find({ sender_id :adminConfig().adminid  }).countDocuments(); 

        if (count > 0) {
          let latestMessage = await Message.findOne({sender_id :adminConfig().adminid }, {}, { sort: { created_at: -1 } }); //24
          // console.log("Lates Message ID:",latestMessage);
          // console.log(Boolean(latestMessage.id !== currentMessageId));
          
          if (Boolean(latestMessage.id !== currentMessageId)) {
            currentMessageId = latestMessage.id;
        
            try {
            
              const targetSocketId = getTargetUserSocketId(userId);
              console.log("Inside Admin",targetSocketId);
              if (targetSocketId) {
                io.to(targetSocketId).emit("newMessagefromadmin", latestMessage.body);
                console.log(`Message sent to user ${userId}: ${latestMessage.body}`);
              } else {
                console.log(`User ${userId} is not connected or invalid.`);
              }
            } catch (error) {
              throw new Error("Error sending message",error);
            }
            // console.log("newMessage event emitted with message:", latestMessage);
          } else {
            // console.log("No new messages.");
          }
        } else {
          console.log("No messages in the collection.");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }, 7);
  }

  // Return the getLatestMessage function from the parent function
  return LatestMessagefromadmin;
}

export const loadchats = async (req,res) => {
   try{
    const token = req.query.token;
   
     if ( !Boolean(token) ) return res.status(200).json({success:false,error :false,message : "Not AUthorised" });

     const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, auth(process.env).jwtSecret, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
        
      });
    });
    
    const user_id= decoded.id;
    
    const messages = await Message.find({
      $or: [
        { sender_id: user_id },
        { reciever_id: user_id }
      ]
    }).sort({ created_at: 1 });
  
    return res.status(200).json({success :true,error:false,messages: messages});

   

   
  }
   catch(e){
  console.log(e);
  return res.status(500).json({success :false,error :true,errors:e});
   }
}

// Call the parent function to get the nested getLatestMessage function

// Now, you can use nestedGetLatestMessage to execute the getLatestMessage function



// export const getLatestMessage = setInterval(async () => {
//   try {
//     const count = await Message.countDocuments();

//     if (count > 0) {     
//       const latestMessage = await Message.findOne(
//         {},
//         {},   
//         { sort: { createdAt: -1 } }
//       );

//       const currentMessageId = latestMessage._id.toString();

//       if (lastRetrievedMessageId !== currentMessageId) {
//         // console.log("New message received:", latestMessage);
//         lastRetrievedMessageId = currentMessageId;
//         io.emit("newMessage", latestMessage);
//       } else {
//         // console.log("No new messages.");
//       }
//     } else {
//       //   console.log("No messages in the collection.");
//     }
//   } catch (error) {
//     console.error("Error:", error);
//   }
// }, 200);
