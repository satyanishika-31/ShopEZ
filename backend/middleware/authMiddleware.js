import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded; // { id, role/usertype, ... }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token invalid" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token provided" });
  }
};
