import { Client, Account, Databases, Storage } from "appwrite";
import { ENDPOINT, PROJECT_ID } from "./config";

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID);

export const account   = new Account(client);
export const databases = new Databases(client);
export const storage   = new Storage(client);
export { client };
