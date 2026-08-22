// Loads .env from the server root no matter which directory the process was
// started from — `npm run dev` and `npm run seed` both end up here.
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(here, "../../.env") });
