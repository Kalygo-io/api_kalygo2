import { logIn } from "./logIn";
import { signUp } from "./signUp";
import { signOut } from "./signOut";
import { resetPassword } from "./resetPassword";
import { mockRequestPasswordReset } from "./mockRequestPasswordReset";
import { requestPasswordReset } from "./requestPasswordReset";
import { verifyAccount } from "./verifyAccount";
import { mockReceiveVerificationToken } from "./mockReceiveVerificationToken";
import { isAuthed } from "./isAuthed";
import { googleSignUp } from "./googleSignUp";
import { googleLogin } from "./googleLogIn";
import { isAdmin } from "./isAdmin";

import { subscriptionSignUp } from "./subscriptionSignUp";

// import { clearAccounts } from "./clearAccounts";

export {
  logIn,
  signUp,
  resetPassword,
  mockRequestPasswordReset,
  requestPasswordReset,
  mockReceiveVerificationToken,
  verifyAccount,
  // clearAccounts,
  isAuthed,
  isAdmin,
  signOut,
  subscriptionSignUp,
  googleSignUp,
  googleLogin,
};
