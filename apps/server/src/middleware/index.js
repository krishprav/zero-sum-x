import jwt from "jsonwebtoken";
import { SECRET, USERS } from "../data/index.js";
export function usermiddleware(req, res, next) {
    const token = req.headers.authorization || req.cookies?.Authorization;
    if (!token) {
        return res.status(403).json({ message: "Incorrect credentials" });
    }
    try {
        const decoded = jwt.verify(token, SECRET);
        //@ts-ignore
        req.userId = decoded.userId;
        if (!USERS[decoded.userId]) {
            return res.status(403).json({ message: "Incorrect credentials" });
        }
        next();
    }
    catch {
        return res.status(403).json({ message: "Incorrect credentials" });
    }
}
//# sourceMappingURL=index.js.map