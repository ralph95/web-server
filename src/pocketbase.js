import PocketBase from "pocketbase";
import { POCKETBASE_URL } from "./config.js";

export const pb = new PocketBase(POCKETBASE_URL);
