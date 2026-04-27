import { Google } from "arctic";

export const googleClient = new Google(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://clinic.nishantsoftwares.in/api/auth/callback"
);