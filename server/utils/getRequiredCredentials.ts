import { Credentials } from "../types/Credentials.js";
import { getCredentials } from "./getCredentials.js";

/**
 * getCredentials logs and returns `{ error }` instead of throwing when credentials are missing
 * or signed for another app. This rejects the request in that case.
 */
export const getRequiredCredentials = (query: any): Credentials => {
  const credentials = getCredentials(query);
  if (!credentials?.profileId || !credentials?.urlSlug || !credentials?.themeName) {
    throw { status: 401, message: "Invalid or missing credentials" };
  }
  return credentials;
};
