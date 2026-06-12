 "use client";

 import { useState, FormEvent } from "react";
 import { useRouter } from "next/navigation";
 import { loginClientSchema } from "@/schemas/clientSchema";
 import Link from "next/link";

 export default function LoginPage() {
   const router = useRouter();
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   const [userInput, setUserInput] = useState("");
   const [password, setPassword] = useState("");

   
   const isEmail = (input: string) => {
     return /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(input);
   };

   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     setError("");
     setLoading(true);

     try {
       const body: any = {
         password: password,
       };

       if (isEmail(userInput)) {
         body.email = userInput;
       } else {
         body.phone = userInput;
       }

       const response = await fetch("/api/user/auth/login", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body),
       });

       const data = await response.json();

       if (!response.ok) {
         setError(data.message || "Login failed. Please try again.");
         return;
       }

       // Success - refresh to re-validate auth state, then redirect
       router.push("/client");
       router.refresh();
     } catch {
       setError("An error occurred. Please try again.");
     } finally {
       setLoading(false);
     }
   };

   return (
     <div className="w-full min-h-screen  flex items-center justify-center px-4 py-8">
       <div className="w-full max-w-md">
       <div className="text-center mb-8">
         <span className="bg-linear-to-r select-none font-bold text-4xl from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ayushman.
         </span>
         <h2 className="mb-4 text-xl font-bold ">
            Consultant Signin 
          </h2>
       </div>

       <form onSubmit={handleSubmit} className="space-y-4">
         {error && (
           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
             {error}
           </div>
         )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number or Email
          </label>

          <input
            type="text"
            required
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter phone number or email"
            pattern="(^[0-9]{10}$)|(^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$)"
            title="Enter a valid 10-digit phone number or email address"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
          />
        </div>

         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">
             Password
           </label>
           <input
             type="password"
             required
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             placeholder="Enter your password"
             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
           />
         </div>

         <button
           type="submit"
           disabled={loading}
           className="w-full font-medium py-2 px-4 rounded-md transition btn-primary"
         >
           {loading ? "Signing in..." : "Sign In"}
         </button>
       </form>

       <div className="mt-6 text-center text-sm">
         <p className="text-gray-600">
           Don&apos;t have an account?{" "}
           <Link href="/user/register" className="text-black font-medium hover:underline">
             Sign up
           </Link>
           <br/>
            <a href="/user/login" className="font-bold hover:underline">
              Forgot Password?
              </a>
         </p>
       </div>
     </div>
     </div>
   );
 }