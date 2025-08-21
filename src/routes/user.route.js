import express from 'express'
import {User} from '../models/user.model.js'
import { createUser, login } from '../controllers/user.controller.js'
import { requireBody } from '../middlewares/validateBody.middleware.js';
const router = express.Router()
//user routes
router.post('/create', requireBody(User), createUser)
router.post('/login', requireBody(User), login)



export default router