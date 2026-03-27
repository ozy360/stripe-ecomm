"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import connectDB from "@/app/lib/mongodb";
import { User } from "@/app/models/Schemas";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileData {
  fullname: string;
  email: string;
  phone?: string;
}

interface AddressData {
  _id?: string;
  label?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault?: boolean;
}

interface Preferences {
  currency?: string;
  language?: string;
}

type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getUserId(): Promise<string> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("usersessionId")?.value;
  if (!userId) throw new Error("User not authenticated");
  return userId;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function getAccountData() {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const userId = cookieStore.get("usersessionId")?.value;

    if (!userId) return null;

    const user = await User.findById(userId).select("-password").lean();
    if (!user) return null;

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error("Error fetching account data:", error);
    return null;
  }
}

export async function updateProfile(
  profileData: ProfileData,
): Promise<ActionResult> {
  try {
    await connectDB();
    const userId = await getUserId();

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          fullname: profileData.fullname.trim(),
          email: profileData.email.trim().toLowerCase(),
          ...(profileData.phone !== undefined && {
            phone: profileData.phone.trim(),
          }),
        },
      },
      { new: true, runValidators: true },
    );

    if (!updated) return { success: false, error: "User not found" };

    revalidatePath("/account");
    return { success: true, message: "Profile updated successfully" };
  } catch (error: any) {
    // Handle duplicate email error from MongoDB
    if (error.code === 11000) {
      return { success: false, error: "This email is already in use" };
    }
    console.error("Error updating profile:", error);
    return { success: false, error: error.message };
  }
}

export async function addAddress(
  addressData: AddressData,
): Promise<ActionResult> {
  try {
    await connectDB();
    const userId = await getUserId();

    // If this address is default, unset all existing defaults first
    if (addressData.isDefault) {
      await User.updateOne(
        { _id: userId },
        { $set: { "shippingAddresses.$[].isDefault": false } },
      );
    }

    // Strip _id from incoming data to avoid conflicts
    const { _id, ...cleanAddress } = addressData;

    await User.findByIdAndUpdate(userId, {
      $push: { shippingAddresses: cleanAddress },
    });

    revalidatePath("/account");
    return { success: true, message: "Address added successfully" };
  } catch (error: any) {
    console.error("Error adding address:", error);
    return { success: false, error: error.message };
  }
}

export async function updateAddress(
  addressId: string,
  addressData: AddressData,
): Promise<ActionResult> {
  try {
    await connectDB();
    const userId = await getUserId();

    // If this address is being set as default, unset all others first
    if (addressData.isDefault) {
      await User.updateOne(
        { _id: userId },
        { $set: { "shippingAddresses.$[].isDefault": false } },
      );
    }

    // Build update fields, excluding _id to prevent immutable field errors
    const updateFields: Record<string, any> = {};
    for (const [key, value] of Object.entries(addressData)) {
      if (key !== "_id") {
        updateFields[`shippingAddresses.$.${key}`] = value;
      }
    }

    const result = await User.updateOne(
      { _id: userId, "shippingAddresses._id": addressId },
      { $set: updateFields },
    );

    if (result.matchedCount === 0) {
      return { success: false, error: "Address not found" };
    }

    revalidatePath("/account");
    return { success: true, message: "Address updated successfully" };
  } catch (error: any) {
    console.error("Error updating address:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAddress(addressId: string): Promise<ActionResult> {
  try {
    await connectDB();
    const userId = await getUserId();

    const result = await User.findByIdAndUpdate(
      userId,
      { $pull: { shippingAddresses: { _id: addressId } } },
      { new: true },
    );

    if (!result) return { success: false, error: "User not found" };

    // If we deleted the default address and others remain, auto-promote the first one
    const remaining = result.shippingAddresses;
    const hasDefault = remaining.some((a: any) => a.isDefault);
    if (!hasDefault && remaining.length > 0) {
      await User.updateOne(
        { _id: userId, "shippingAddresses._id": remaining[0]._id },
        { $set: { "shippingAddresses.$.isDefault": true } },
      );
    }

    revalidatePath("/account");
    return { success: true, message: "Address deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting address:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePreferences(
  preferences: Preferences,
): Promise<ActionResult> {
  try {
    await connectDB();
    const userId = await getUserId();

    await User.findByIdAndUpdate(userId, {
      $set: { preferences },
    });

    revalidatePath("/account");
    return { success: true, message: "Preferences updated successfully" };
  } catch (error: any) {
    console.error("Error updating preferences:", error);
    return { success: false, error: error.message };
  }
}
