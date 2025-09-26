import * as dotenv from "dotenv";

export const envConfig = () => {
  // Load environment variables from .env file or throw an error if it fails
  if (process.env.PRODUCTION) {
    const pharmalinkEnv = dotenv.config({
      path: "./.env.prod.local",
    });
    if (pharmalinkEnv.error) {
      throw pharmalinkEnv.error;
    }
  } else if (process.env.RC) {
    const rcEnv = dotenv.config({
      path: "./.env.rc.local",
    });
    if (rcEnv.error) {
      throw rcEnv.error;
    }
  } else {
    const result = dotenv.config({
      path: "./.env.local",
    });
    if (result.error) {
      throw result.error;
    }
  }
};
