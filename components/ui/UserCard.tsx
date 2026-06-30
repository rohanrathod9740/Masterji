"use client";
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useUser } from "@/lib/UserProvider";
import { useRouter } from "next/navigation";

export default function UserCard() {
  const [logoutPressed, setLogoutPressed] = useState(false);
  const router = useRouter();

  const handleLogOut = async () => {
    setLogoutPressed(true);
    try {
      const response = await fetch("/api/user/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Logout failed");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    } finally {
      setLogoutPressed(false);
    }
  };

  const { user } = useUser();
  if (!user) {
    return <div className="text-sm text-muted-foreground">No user data</div>;
  }

  return (
    <Card className="max-w-md">
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>{user.email}</CardTitle>
          <CardDescription className="capitalize">{user.role.toLowerCase()}</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-sm space-y-1">
          {user.email && (
            <div>
              <strong>Email:</strong>{" "}
              <span className="break-all">{user.email}</span>
            </div>
          )}
          {user.phone && (
            <div>
              <strong>Phone:</strong>{" "}
              <span>{user.phone}</span>
            </div>
          )}
          {user.lastLoginAt && (
            <div>
              <strong>Last login:</strong>{" "}
              <span>{new Date(user.lastLoginAt).toLocaleString()}</span>
            </div>
          )}
        </div>

        <button className="mt-4 w-full font-medium py-2 px-4 rounded-md transition btn-primary">
          Edit Profile
        </button>

        <button
          onClick={handleLogOut}
          disabled={logoutPressed}
          className="mt-4 w-full font-medium py-2 px-4 rounded-md transition bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
        >
          Logout
        </button>
      </CardContent>

      <CardFooter />
    </Card>
  );
}
