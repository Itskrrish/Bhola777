#!/usr/bin/env node

/**
 * Module dependencies.
 */
import expres from "express";
import http from "node:http";
import app from "../server/http.js";
import { db } from "../config/index.js";
import auth  from "../config/auth.js";
import adminConfig from  "../config/admin.js";
import  Message from "../models/Message.js";
import { Server } from "socket.io";
import router from "../router/index.js";
import { initMessageListener,getLatestMessage,getLatestMessagefromadmin} from "../controller/MessageController.js";
import socketioJwt from 'socketio-jwt';
import jwt from "jsonwebtoken";


// import WsServer from '#server/websocket';

const port = Number(process.env.APP_PORT) || 8005;

/**
 * initialize logger instance
 *
 */

/**
 * Do stuff and exit the process
 * @param {NodeJS.SignalsListener} signal
 */
function signalHandler(signal) {
  console.log(`Stopping the server 🙁 [${process.pid}] [signal:${signal}]`);
  process.exit();
}

process.on("SIGINT", signalHandler);
process.on("SIGTERM", signalHandler);
process.on("SIGQUIT", signalHandler);
process.on("warning", (e) => console.warn(e.stack));
// process.on('unhandledRejection', (err, promise) => {
//     Log.error(`Unhandled promise rejection [${process.pid}] ${err.message}`, { data:err.stack });
//     // server.close(() => process.exit(1));
// });

/**
 * Create HTTP and WebSocket server
 * @param {Express.Application} app
 */
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// console.log( Boolean(adminConfig().adminid == "6618c86c5c3b3fba8c1ff657") );

// const getclienttoken = async(req,res) =>{
//     const token = req.user
// }
 let secret =auth(process.env).jwtSecret;

 io.use(socketioJwt.authorize({
  secret: secret,
  handshake: true
}));

let usersocketidmap ={};
let adminactivesession;
function getTargetUserSocketId(targetUserId) {
  // Logic to retrieve the socket ID for the target user
  // For example:
  return usersocketidmap[targetUserId];
}

 io.on("connection", (socket) => {
  const userId = socket.decoded_token.id;
  console.log("Socket connected",userId);
  if (!usersocketidmap[userId]) usersocketidmap[userId]=[];
  usersocketidmap[userId].push(socket.id);
  console.log(usersocketidmap);


  //New ADmin session staretd
  socket.on("NewSessionStarted",(activeuserId) =>{
    adminactivesession = activeuserId;
    console.log("Active session with:",activeuserId);
  });
  //end
 
  socket.on("sendToUser", async ({ userId, message }) => {
    try {
      // Get the target user's socket ID
      const targetSocketId = getTargetUserSocketId(userId);
      await Message.create({body:message,sender_id: adminConfig().adminid, reciever_id : userId});
      console.log(targetSocketId);
      
      // Check if the target socket ID is valid
      if (targetSocketId) {
        // Send the message only to the target user
        io.to(targetSocketId).emit("newMessagefromadmin", message);
        console.log(`Message sent to user ${userId}: ${message}`);
      } else {
        console.log(`User ${userId} is not connected or invalid.`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });
  
  //listen message for admin
  socket.on("sendmessageToAdmin", async ({ token, message }) => {
    try {
      let user_id;
      // Decode token to get user id
      const decoded = await verifyToken(token);
      if (!decoded) {
        socket.emit("errorMessage", { error: "Unauthorized to Send Message" });
        return;
      }
      console.log(decoded);
      user_id = decoded.id;
      console.log("USER ID", decoded.id);
      
      // Get the target user's socket ID
      const targetSocketId = getTargetUserSocketId("6618c86c5c3b3fba8c1ff657");
      const created_message=await Message.create({ body: message, sender_id: user_id, reciever_id: adminConfig().adminid });
      const sender_id= created_message.sender_id;
    
      console.log("Admin socket Id", targetSocketId);
      
      // Check if the target socket ID is valid
      if (targetSocketId) {
        // Send the message only to the target user
        io.to(targetSocketId).emit("newMessagefromuser",  { message, adminactivesession,sender_id });
        console.log(`Message sent to user ${user_id}: ${message}`);
      } else {
        console.log(`User ${user_id} is not connected or invalid.`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // You can also emit an error event to the client if needed
      // socket.emit("errorMessage", { error: "Failed to send message" });
    }
  });
  
  // Function to verify JWT token
  function verifyToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, auth(process.env).jwtSecret, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });
  }
  
  //end

  socket.on("eventtest", () => console.log('eventest listen'));
  socket.on("disconnect", () => {
    delete usersocketidmap[userId];
  });

  
});







getLatestMessage();
const nestedGetLatestMessage = await getLatestMessage();
nestedGetLatestMessage();


// const nestedadminmessage=await getLatestMessagefromadmin();
// nestedadminmessage();



 
io.on("sendToUser", ({ userId, message }) => {
  sendMessageToUser(userId, message)
    .then(() => {
      console.log("Message sent successfully");
    })
    .catch((error) => {
      console.error("Error sending message:", error);
    });
});

// async function sendMessageToUser(userId, message) {
//   try {
//     await Message.create({ body: message, sender_id: "660d82be09ee5f08606aa2f3", reciever_id: userId });
//     const targetSocketId = getTargetUserSocketId(userId);
//     if (targetSocketId) {
//       io.to(targetSocketId).emit("newMessagefromadmin", message);
//       console.log(`Message sent to user ${userId}: ${message}`);
//     } else {
//       console.log(`User ${userId} is not connected or invalid.`);
//     }
//   } catch (error) {
//     throw new Error("Error sending message");
//   }
// }

/**
 * Attach router to this socket server
 * ------------------------------------------------
 * listen and dispatch all io events to coresponding controllers
 *
 */
// router(io);

// WsServer.init(server);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
db.connect((error, success) => {
  console.log({ error, success });
  // if (error) {
  //     console.error("Failed to connect to MongoDB:", error);
  // } else {
  //     console.log("Connected to MongoDB successfully.");
  //     // Any further logic that depends on the database connection can go here
  // }
});
// Iterate over the layers in the router stack

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  //  handle specific listen errors with logs

  switch (error.code) {
    case "EACCES":
      consoloe.log(`Port ${port} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.log(`Port ${port} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  // const addr = server.address();
  // const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  console.log(
    `The Server [${process.pid}] started listening on port ${port} 🥳`
  );
}
