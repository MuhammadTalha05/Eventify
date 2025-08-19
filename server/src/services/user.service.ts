import prisma from "../config/db.config";
import { isPhoneNumber, isStrongPassword } from "../utils/validation.util";
import { hashPassword, comparePassword } from "../utils/hash.util";

// Get single user profile by ID
export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) throw new Error("User not found");
  return user;
}


// Update user profile
export async function updateUserProfile(
  userId: string,
  data: { fullName?: string; phone?: string; avatarUrl?: string }
) {
  if (data.phone && !isPhoneNumber(data.phone)) {
    throw new Error("Phone number must be in format +92XXXXXXXXXX or 03XXXXXXXXX");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) throw new Error("User not found or update failed");
  return user;
}

// Get All User For Admins
export async function getAllUsers(adminId: string) {
  return prisma.user.findMany({
    where: {
      NOT: { id: adminId },
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
}


// Change user role (Admin only)
export async function changeUserRole(userId: string, newRole: "ADMIN" | "PARTICIPANT") {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      updatedAt: true,
    },
  });

  if (!user) throw new Error("User not found or role update failed");
  return user;
}


// Updat User Password
export async function updateUserPassword(
  userId: string,
  oldPassword: string,
  newPassword: string
) {
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, passwordHash: true },
  });
  
  if (!user) {
    throw new Error("User not found");
  }
  
  if (!user.passwordHash) {
    throw new Error("This account does not have a password set");
  }
  
  const isMatch = await comparePassword(oldPassword, user.passwordHash);
  if (!isMatch) {
    throw new Error("Old password is incorrect");
  }
  if (!isStrongPassword(newPassword)) throw new Error("New Password must be at least 8 chars and contain letters and numbers");

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashedPassword },
  });

  return true;
}