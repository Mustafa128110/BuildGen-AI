import "server-only";

// Stable public server contract. Routes and other features depend on this facade,
// never on the provider's internal implementation or another feature's UI.
export { authConfiguration } from "./provider";
export { AUTH_COOKIES, clearSessionCookies, setSessionCookies } from "./cookies";
export { isRegisteredUser, verifyAccessToken, resolveSession } from "./session";
export { userView } from "./profile";
export { signIn, registerAccount, confirmEmail, signOut, sendOtp, verifyOtpCode } from "./service";
