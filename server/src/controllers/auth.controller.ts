import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { AuthRequest } from "../middlewares/auth.middleware";


// Signup Request Controller
export async function signup(req: Request, res: Response) {
  try {
    const { fullName, email, phone, password, role  } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ error: "Full Name, Email, Phone, Password are reuqired" });
    }
    const result = await authService.signup(fullName, email, phone, password,role);
    res.json(result);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
}


// Signin Controller
export async function signin(req: AuthRequest, res: Response) {
  try {
   const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    // authenticate user via service
    const result = await authService.signinWithPassword(email, password);
    res.json(result);

  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
}


// LOGIN STEP 2: verify login OTP -> return tokens
export async function verifyLogin(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const result = await authService.verifyLoginOtp(email, otp);
    res.json(result); // { user, accessToken, refreshToken }
  } catch (err: unknown) {
    if (err instanceof Error) return res.status(400).json({ error: err.message });
    return res.status(400).json({ error: "An unknown error occurred" });
  }
}


// Reset Password Request Controller
export async function resetPasswword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const result = await authService.requestPasswordReset(email);
    res.json(result);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
}


// Reset Passowrd Controller
export async function verifyReset(req: Request, res: Response) {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!otp) return res.status(400).json({ error: "OTP is required" });
    if (!newPassword) return res.status(400).json({ error: "New password is required" });

    const result = await authService.resetPassword(email, otp, newPassword);
    res.json(result);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
}


// Refreshing Access Token Controller
export async function refreshAccessToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "Refresh token is required" });

    const result = await authService.refreshAccessToken(refreshToken);
    res.json(result);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
}


// Logout Controller
export async function logout(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { fullName } = await authService.logout(req.user.sub);

    res.json({ message: `${fullName} successfully logged out` });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
}