import { Router, type Request, type Response } from "express";
import { v5 } from "uuid";
import jwt from "jsonwebtoken";
import { SECRET, USERS } from "../data/index.js";
import { credentailSchma } from "../types/userschema.js";
import { usermiddleware } from "../middleware/index.js";
import { getCookieOptions, toInternalUSD } from "../utils/utils.js";
export const userRouter: Router = Router();

userRouter.post("/signup", (req: Request, res: Response) => {
  try {
    const parseduserinfo = credentailSchma.safeParse(req.body);

    if (!parseduserinfo.success) {
      return res.status(403).json({
        message: "Error while signing up",
      });
    }

    const { email, password } = parseduserinfo.data;
    const uuid = v5(email, "f0e1d2c3-b4a5-6789-9876-543210fedcba");
    if (USERS[uuid]) {
      return res.status(403).json({
        message: "Error while signing up",
      });
    }

    USERS[uuid] = {
      email: email,
      password: password,
      assets: {},
      balance: {
        usd_balance: toInternalUSD(5000), // decimals 2
      },
    };
    return res.status(200).json({
      userId: uuid,
    });
  } catch {
    return res.status(403).json({
      message: "Error while signing up",
    });
  }
});

userRouter.post("/signin", (req: Request, res: Response) => {
  try {
    const parsedData = credentailSchma.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(403).json({
        message: "Incorrect credential",
      });
    }
    const { email, password } = parsedData.data;

    const uuid = v5(email, "f0e1d2c3-b4a5-6789-9876-543210fedcba");
    if (!USERS[uuid] || USERS[uuid].password !== password) {
      return res.status(403).json({
        message: "Incorrect credential",
      });
    }

    const token = jwt.sign({ userId: uuid }, SECRET);
    return res.status(200).json({
      token: token,
    });
  } catch {
    return res.status(403).json({
      message: "Incorrect credentials",
    });
  }
});

userRouter.get("/balance", usermiddleware, (req: Request, res: Response) => {
  //@ts-ignore
  const userid = req.userId;
  return res.status(200).json({
    usd_balance: USERS[userid]!.balance.usd_balance,
  });
});
