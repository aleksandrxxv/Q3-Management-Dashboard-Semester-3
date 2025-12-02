"use client";

import AuthForm from "@/components/AuthForm";

export default function Page() {
  const signup = async (email: string, password: string) => {
    const res = await fetch("/api/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error("Could not create user");

    window.location.href = "/dashboard/machines";
  };

  return <AuthForm mode="signup" onSubmit={signup} />;
}
