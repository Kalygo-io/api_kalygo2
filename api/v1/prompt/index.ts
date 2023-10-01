import {
  getPrompt,
  deletePrompt,
  searchForPrompts,
  similaritySearchForPrompts,
} from "./handlers";
import { Router } from "express";
import { authenticateToken } from "@middleware/index";
import { addToAccessGroup } from "./handlers/addToAccessGroup";
import { removeFromAccessGroup } from "./handlers/removeFromAccessGroup";
import { getPublicPrompt } from "./handlers/getPublicPrompt";
import { isPromptPublic } from "@/middleware/isPromptPublic";
import { ratePrompt } from "./handlers/ratePrompt";

const router = Router();

router.route("/prompt/:id").delete(authenticateToken, deletePrompt);
router.route("/prompt/:id").get(authenticateToken, getPrompt);
router.route("/get-public-prompt/:id").get([isPromptPublic], getPublicPrompt);
router.route("/prompts/search").post([authenticateToken], searchForPrompts);
router
  .route("/prompts/similarity-search")
  .post([authenticateToken], similaritySearchForPrompts);
router.route("/rate-prompt/:id").post([authenticateToken], ratePrompt);
router
  .route("/add-prompt-to-access-group")
  .post([authenticateToken], addToAccessGroup);
router
  .route("/remove-prompt-from-access-group")
  .delete([authenticateToken], removeFromAccessGroup);

export default router;
