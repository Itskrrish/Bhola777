import dotenv from "dotenv";
import dbConfig from "./database.js";
import authConfig from "./auth.js";
import process from "process";

import path from "path";
function rootPath() {
  // let rootPath = process.env.PWD;
  // return rootPath.replace('/bin', '');
  return path.resolve();
}
function getPath(path = false) {
  if (path) {
    return rootPath() + "/" + path;
  }
  return rootPath();
}

dotenv.config({ path: getPath(".env") });
export const db = dbConfig(process.env);

export const auth = authConfig(process.env);

export default { db, auth };
