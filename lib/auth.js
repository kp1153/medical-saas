import { Google } from "arctic";

export const googleClient = new Google(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://medical-saas-32pt.vercel.app/api/auth/callback"
);