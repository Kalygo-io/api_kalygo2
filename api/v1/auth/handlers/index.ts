import { signIn } from "./signIn";
import { signUp } from "./signUp";
import { signOut } from "./signOut";
import { resetPassword } from "./resetPassword";
import { mockRequestPasswordReset } from "./mockRequestPasswordReset";
import { requestPasswordReset } from "./requestPasswordReset";
import { verifyAccount } from "./verifyAccount";
import { mockReceiveVerificationToken } from "./mockReceiveVerificationToken";
import { deleteAccount } from "./deleteAccount";
import { isAuthed } from "./isAuthed";
// import { clearAccounts } from "./clearAccounts";

export {
  signIn,
  signUp,
  resetPassword,
  mockRequestPasswordReset,
  requestPasswordReset,
  mockReceiveVerificationToken,
  verifyAccount,
  deleteAccount,
  // clearAccounts,
  isAuthed,
  signOut,
};
