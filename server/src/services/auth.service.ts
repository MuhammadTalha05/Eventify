import prisma from "../config/db.config";
import { hashPassword, comparePassword } from "../utils/hash.util";
import * as otpService from "./otp.service";
import { isEmail, isStrongPassword ,isPhoneNumber } from "../utils/validation.util";
import { signAccessToken, signRefreshToken , verifyRefreshToken } from "../utils/jwt.util";


// Signup Request Auth Service
export async function signup(fullName: string, email: string, phone: string, password: string, role?: string) {
  // Validation Handling
  if (!isEmail(email)) throw new Error("Invalid email");
  if (!isPhoneNumber(phone)) throw new Error("Phone number must be in format +92XXXXXXXXXX or 03XXXXXXXXX");
  if (!isStrongPassword(password)) throw new Error("Password must be at least 8 chars and contain letters and numbers");

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("Email already registered");

  const hashedPassword = await hashPassword(password);

  const userRole = role === "ADMIN" ? "ADMIN" : "PARTICIPANT";

  const newUser = await prisma.user.create({
    data: {
      fullName,
      email,
      phone,
      passwordHash: hashedPassword,
      role: userRole,
    },
  });

  return { 
    message: "Signup successful. You can now log in.", 
    userId: newUser.id 
  };
}


// Login with password Auth Service
export async function signinWithPassword(email: string, password: string) {
  // Validate inputs
  if (!isEmail(email)) throw new Error("Invalid email format");
  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const valid = await comparePassword(password, user.passwordHash ?? "");
  if (!valid) throw new Error("Invalid password");

  await otpService.createAndSendOtp(user.id, "LOGIN");

  return { message: "OTP sent to your email. Please verify to complete login." };
}


// LOGIN STEP 2: verify OTP -> issue tokens & store single refresh token
export async function verifyLoginOtp(email: string, otpCode: string) {
  // Validation Handling
  if (!isEmail(email)) throw new Error("Invalid email format");
  if (!otpCode) throw new Error("OTP is required");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  await otpService.verifyOtp(user.id, otpCode, "LOGIN");

  // Generate tokens
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Keep only ONE refresh token per user
  await prisma.refreshToken.upsert({
    where: { userId: user.id },
    update: { token: refreshToken, expiresAt, revoked: false },
    create: { userId: user.id, token: refreshToken, expiresAt },
  });

  return {
    message: "Login successful",
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
    accessToken,
    refreshToken,
  };
}


// Request Reset Password Auth Service
export async function requestPasswordReset(email: string) {
  // Validation
  if (!isEmail(email)) throw new Error("Invalid email format");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  await otpService.createAndSendOtp(user.id, "PASSWORD_RESET");
  return { message: "Password reset OTP sent to email" };
}


// Reset Password Auth Service
export async function resetPassword(email: string, otpCode: string, newPassword: string) {

  // Validation
  if (!isEmail(email)) throw new Error("Invalid email format");
  if (!isStrongPassword(newPassword)) throw new Error("Password must be at least 8 chars and contain letters and numbers");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  await otpService.verifyOtp(user.id, otpCode, "PASSWORD_RESET");

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashedPassword },
  });

  return { message: "Password reset successful" };
}


// Refresh access token Auth Service
export async function refreshAccessToken(refreshToken: string) {
  
  if (!refreshToken.trim()) throw new Error("Invalid refresh token");

  // Find token in DB
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });
  if (!tokenRecord) throw new Error("Invalid refresh token");

  // Check if token expired
  if (tokenRecord.expiresAt < new Date() || tokenRecord.revoked) {
    throw new Error("Refresh token expired or revoked");
  }

  // Verify token
  verifyRefreshToken(refreshToken);

  // Generate new access token
  const newAccessToken = signAccessToken({ sub: tokenRecord.user.id, role: tokenRecord.user.role });
  return { accessToken: newAccessToken };
}


// LogOut Auth Service
export async function logout(userId: string) {
  // Find user first to get full name
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  // Delete the user's refresh token(s)
  await prisma.refreshToken.deleteMany({ where: { userId } });

  return { fullName: user.fullName };
}