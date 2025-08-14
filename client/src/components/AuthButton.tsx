"use client";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";

export default function AuthButton() {
  const { user } = useUser();

  if (user) {
    return (
      <SignOutButton>
        <button className="px-4 py-2 bg-red-600 text-white rounded">
          Logout
        </button>
      </SignOutButton>
    );
  }

  return (
    <SignInButton mode="modal">
      <button className="px-4 py-2 bg-blue-600 text-white rounded">
        Start Free
      </button>
    </SignInButton>
  );
}
