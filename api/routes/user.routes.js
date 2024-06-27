import express from "express";
import {updateUser,deleteUser, getUserPosts,getUser} from "../controllers/user.controller.js"; 
import {verifyToken} from "../utils/verifyUser.js"
const router = express.Router();

router.post("/update/:id",verifyToken,updateUser);
router.delete("/delete/:id",verifyToken,deleteUser)
router.get("/posts/:id",verifyToken,getUserPosts)
router.get("/:id", verifyToken, getUser)

export default router;