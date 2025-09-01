import bcrypt from "bcryptjs";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import { signUpSchema, signInSchema, type User } from "@shared/schema";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET || "default-secret-key-for-development",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Sign up route
  app.post("/api/auth/signup", async (req, res) => {
    console.log("Signup body received:", req.body);
    try {
      const { email, password, firstName, lastName } = signUpSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;

      // Set up session
      (req.session as any).userId = newUser.id;

      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Signup error:", error);
      res.status(400).json({ message: "Invalid signup data" });
    }
  });

  // Sign in route
  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = signInSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      // Set up session
      (req.session as any).userId = user.id;

      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Signin error:", error);
      res.status(400).json({ message: "Invalid signin data" });
    }
  });

  // Sign out route
  app.post("/api/auth/signout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({ message: "Could not sign out" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Signed out successfully" });
    });
  });

  // Get current user route
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  const userId = (req.session as any)?.userId;
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.userId = userId;
  next();
};