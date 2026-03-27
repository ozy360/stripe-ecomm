"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("adminsessionId");

    redirect("/login");
  } catch (err: any) {
    if (err.message?.includes("NEXT_REDIRECT")) {
      throw err;
    }

    console.error("Logout error:", err);
    throw new Error("Failed to logout");
  }
}
