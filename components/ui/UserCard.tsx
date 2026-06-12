"use client"
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useUser } from "@/lib/UserProvider";



export default function UserCard() {
    const { user } = useUser();
    if(!user){
        return <div className="text-sm text-muted-foreground">No user data</div>;
    }
    console.log(user);

  return (
    <Card className="max-w-md">
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>{user.name}</CardTitle>
          {user.name && <CardDescription>{user.name}</CardDescription>}
        </div>

        
      </CardHeader>

        <CardContent>
          <div className="text-sm space-y-1">
            {user.email && (
              <div>
                <strong>Email:</strong> {" "}
                <span className="break-all">{user.email}</span>
              </div>
            )}
            {user.phone && (
              <div>
                <strong>Phone:</strong> {" "}
                <span>{user.phone}</span>
              </div>
            )}
            
          </div>
        </CardContent>

      <CardFooter />
    </Card>
  );
}
