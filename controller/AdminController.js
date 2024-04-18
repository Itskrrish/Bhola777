import express from "express";
import User from "../models/User.js";
import Message from "../models/Message.js";
import { io } from "../bin/standalone.js";
import adminConfig from  "../config/admin.js";

export const allusers = async (req, res) => {
    try {
      const users = await User.find({});
      console.log(users.phone);
      return res.render('admin/users/index', { users });
    } catch (error) {
      console.error("Error:", error);
      // Handle the error appropriately, such as showing an error page
      return res.status(500).send("Internal Server Error");
    }
  }


  export const userchates = async (req,res) => {
    try {
      const usersWithMessages = await User.aggregate([
        {
          $lookup: {
            from: "messages",
            let: { userId: "$id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ["$sender_id", "$$userId"] },
                      { $eq: ["$receiver_id", "$$userId"] }
                    ]
                  }
                }
              }
            ],
            as: "user_messages"
          }
        }
      ]);
      return res.render('admin/chat/user_chat',{ data :usersWithMessages });  
    //   console.log(usersWithMessages);
   
} catch (error) {
      console.error("Error:", error);
    }

  
  };
  
  export const sendadminmessgae = async (req,res) => {
    try {
     const {body, userId} = req.body;
     console.log(userId);
     if (!Boolean(body)  ) return res.json({message :"Please WRite Message",status :true,error:false});
     if (!Boolean(userId)  ) return res.json({message :"bad Request,Target User Not Found",status :true,error:false});
     await Message.create(
        {
         body:body,
         sender_id:adminConfig().adminid,
         reciever_id :userId
        }
     );

     return res.status(200).json({message:"message sent successfully",status:true,error:false});
    }
    catch(err){
     console.log(err);
       return res.status(400).json({message: err.message || "Server Error!", status: false , error: true});
    }
  } ;
  // Call the function to retrieve the list of users with messages
//   userchates();

 export const activechatsession = async () =>{
    const userSocketMap = {};

 // When a new user connects, store their socket ID in the map
     io.on("connection", (socket) => {
     const userId = getUserIdFromSocket(socket); // Implement this function to get user ID
     userSocketMap[userId] = socket.id;

  // You might want to handle disconnection to remove the user from the map
     socket.on("disconnect", () => {
    delete userSocketMap[userId];
    });

});
}

export const loadadminchats = async (req,res) => {
  try {
   const target_user_id = req.query.user_id;
   const usermessages = await Message.find({ sender_id: target_user_id , reciever_id:adminConfig().adminid});
  
   const messages = await Message.find({
    $or :
    [ { sender_id: target_user_id , reciever_id: adminConfig().adminid } ,
      { sender_id:adminConfig().adminid ,  reciever_id: target_user_id }   //either message send by admin to user
        // or message send to admi by user
    ]
  })
   .sort({ created_at: 1 });
   
   if ( !Boolean(messages) ) return res.status(200).json({success:true,error :false,message : "Say Hi To start Chat" });

  console.log("admin",messages  );
  return res.status(200).json({success :true,error:false,messages: messages});
}
 
catch(e)
{
 console.log(e);
 return res.status(500).json({success :false,error :true,errors:e});
  }
}




// export const realtimeadmin = async () => {
//     io.socket.on("sendToUser", ({ userId, message }) => {
//         try {
//           // Get the target user's socket ID
//           const targetSocketId = getTargetUserSocketId(userId);
          
//           // Check if the target socket ID is valid
//           if (targetSocketId) {
//             // Send the message only to the target user
//             io.to(targetSocketId).emit("newMessage", message);
//             console.log(`Message sent to user ${userId}: ${message}`);
//           } else {
//             console.log(`User ${userId} is not connected or invalid.`);
//           }
//         } catch (error) {
//           console.error("Error sending message:", error);
//         }
//       });
// }