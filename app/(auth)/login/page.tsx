 "use client";

 import { useState, FormEvent } from "react";
 import { useRouter } from "next/navigation";
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
         body.userEmail = userInput;
       } else {
         body.userPhone = userInput;
       }

       const response = await fetch("/api/auth/login", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body),
       });

       const data = await response.json();

       if (!response.ok) {
         setError(data.message || "Login failed. Please try again.");
         return;
       }

       // Success - redirect to dashboard
       router.push("/");
       router.refresh();
     } catch {
       setError("An error occurred. Please try again.");
     } finally {
       setLoading(false);
     }
   };

   return (
     <div className="w-full max-w-md">
       <div className="text-center mb-8">
         <h1 className="text-3xl font-bold mb-2">Ayushman!</h1>
         <p className="text-gray-600">Sign in to your account</p>
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
           className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
         >
           {loading ? "Signing in..." : "Sign In"}
         </button>
       </form>

       <div className="mt-6 text-center text-sm">
         <p className="text-gray-600">
           Don&apos;t have an account?{" "}
           <Link href="/register" className="text-black font-medium hover:underline">
             Sign up
           </Link>
         </p>
       </div>
     </div>
   );
 }