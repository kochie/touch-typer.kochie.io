"use client";

import { signOut } from "aws-amplify/auth";



export default function SignOutButton() {
    const handleSignOut = async () => {
        console.log("Sign out");
        await signOut()
      }

    return (
        <button onClick={handleSignOut}>Sign Out</button>
    )
}