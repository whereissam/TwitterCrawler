import { Request, Response } from "express";
import * as AccountService from "../service/account-service.js";

export const createAccount = async (req: Request, res: Response) => {
  try {
    const { username, id, type } = req.body;
    
    if (!username || !id || !type) {
      return res.status(400).json({ error: 'Username, id, and type are required' });
    }
    
    if (type !== 'product' && type !== 'influencer') {
      return res.status(400).json({ error: 'Type must be either product or influencer' });
    }

    // ID should be a string from Twitter's API
    if (typeof id !== 'string' || !id.trim()) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const user = await AccountService.create({ username, id, type });
    res.status(201).json(user);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const findAllAccounts = async (req: Request, res: Response) => {
  const accounts = await AccountService.findAll();
  res.status(200).json(accounts);
};

// export const getOneAccountById = async (req: Request, res: Response) => {
//   const id = Number(req.params.id);
//   const result = await AccountService.findById(id);

//   if (!result) {
//     res.status(404).send();
//   } else {
//     res.status(200).json(result);
//   }
// };