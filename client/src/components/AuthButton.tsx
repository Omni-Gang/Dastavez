"use client";
import { useUser, useClerk, SignInButton, SignOutButton } from "@clerk/nextjs";

export default function AuthButton() {
  const { user } = useUser();
  const clerk = useClerk();

  if (user) {
    return (
      <div>
        <p>Hi, {user.fullName ?? user.emailAddresses?.[0]?.emailAddress}</p>
        <SignOutButton>
          <button>Logout</button>
        </SignOutButton>
      </div>
    );
  }

  return (
    <div>
      <SignInButton>
        <button>Sign in</button>
      </SignInButton>
    </div>
  );
}
