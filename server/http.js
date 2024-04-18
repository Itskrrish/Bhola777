/**
 * Module dependencies.
 */
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import exphbs from "express-handlebars";

import router from "../router/index.js";
import cookieParser from 'cookie-parser';
import fs from "fs";
import { fileURLToPath } from 'url';

import path from "path";
import { dirname } from 'path';

// import swagger         from '#app/utils/swagger';
// import models 	      from '#app/model/index';
// import statusMonitor   from 'express-status-monitor';
// import MessageBroker   from '#app/service/messageBroker/index';

const app = express();
app.use(express.static("public"));
app.engine(".hbs", exphbs.engine({ extname: ".hbs", 
runtimeOptions: {
  allowProtoPropertiesByDefault: true,
  allowProtoMethodsByDefault: true
},
defaultLayout: false }));

// Get the directory path where the script is executed
const __filename = fileURLToPath(import.meta.url);

// Resolve the directory name from the file path
const currentDir = path.dirname(__filename);


const viewsDir = path.resolve(currentDir, '..', 'views');


// Construct the correct path to the navbar partial
const navbarPartialPath = path.join(viewsDir, 'admin', 'partials', '_navbar.hbs');
const sidebarPartialPath = path.join(viewsDir, 'admin', 'partials', '_sidebar.hbs');
const footerPartialPath = path.join(viewsDir, 'admin', 'partials', '_footer.hbs');



// Read the content of the file
let navbarPartialContent;
let sidebarPartialContent;
let footerPartialContent;
try {
  navbarPartialContent = fs.readFileSync(navbarPartialPath, 'utf8');
  sidebarPartialContent = fs.readFileSync(sidebarPartialPath, 'utf8');
  footerPartialContent = fs.readFileSync(footerPartialPath, 'utf8');
 
  if (!navbarPartialContent.trim()) {
    throw new Error('Navbar partial content is empty');
  }
} catch (err) {
  console.error(err);
  // Handle file read error or empty content error
  process.exit(1); // Exit the script or handle it as needed
}

const hbs = exphbs.create({
  partialsDir: [path.join(viewsDir, "admin/partials")],
 
});
console.log(hbs);
// Register the partial with Handlebars
hbs.handlebars.registerPartial('navbar', navbarPartialContent);
hbs.handlebars.registerPartial('sidebar', sidebarPartialContent);
hbs.handlebars.registerPartial('footer', footerPartialContent);

// app.set("views",path.join(__dirname,"views/admin/partials"));
app.set("view engine", ".hbs");



/**
 * Set up database and redis connections
 *


// await config.redis.connect((error, status) => {
// 	if(!!error) {
// 		Log.error(`Error connecting to redis server [${process.pid}]`, { data:error, sync:true });
// 		// process.exit();
// 	}

// 	if (status) Log.info(`process [${process.pid}] connected to the redis server`)
// });

/**
 * Attach configs to express app.
 */
// app.set('port', config.server.port);
// app.set('config', config); // The system configrations
// app.set('db', models); // attach models to express instance
// app.set('log', Log); // attach logger to express

// app.use(express.static(getPath('/storage/public/')));

// app.get('/*', (req, res) => {
// 	res.sendFile(getPath('/storage/public/html/index.html'));
// });

/**
 * Attach utility middlwares to express app.
 */
// bodyParser, parses the request body to be a readable json format
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cors());
app.use(cors({ origin: true, optionsSuccessStatus: 200, credentials: true }));
app.options(
  "*",
  cors({ origin: true, optionsSuccessStatus: 200, credentials: true })
);

app.use(bodyParser.json());
app.use(cookieParser());
// app.use(methodOverrider());
// app.use(compression());

/**
 * Attach api documentation routes.
 */
// app.use('/api/docs', swagger.router);

/**
 * Attach identifier to each request
 */
app.use(express.urlencoded({ extended: true }));
/**
 * Attach router to express app.
 */
app.use(router);

/**
 * Set fallback url for routes.
 */
// app.use((req, res, _) => {
//   telescope.routeNotFound(req);
//   res.status(404).json({
//     status: false,
//     type: "Resource Not Found",
//     message: "the url you are trying to reach is not hosted on our server",
//   });
// });

/**
 * Log errors.
 */
// app.use((err, req, res, _) => sendError(req, res, err));

// app.use((err, req, res, _) => {
// 	telescope.requestError(err, req);
//     res.status(err.status || 500).json({ status:false, type: 'error', message: err.message || 'Something went wrong' });
// });

/**
 * Export Express App.
 */
export default app;
