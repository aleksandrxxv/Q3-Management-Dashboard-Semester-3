"use client";

import { useState } from "react";

export default function SignupPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    rePassword: "",
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (k: string, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.rePassword) {
      setError("Passwords do not match");
      return;
    }

    await fetch("/api/signup", {
      method: "POST",
      body: JSON.stringify(form),
    });

    window.location.href = "/dashboard/machines";
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#1a1a1a]">

      {/* Orange Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br 
      from-orange-500/40 via-orange-400/25 to-yellow-300/20 
      blur-3xl opacity-70"></div>

      {/* Glow blobs */}
      <div className="absolute -top-40 -left-40 w-[35rem] h-[35rem] 
      bg-orange-500/40 rounded-full blur-[150px] opacity-70"></div>

      <div className="absolute bottom-0 right-0 w-[45rem] h-[45rem] 
      bg-yellow-300/30 rounded-full blur-[150px] opacity-60"></div>

      {/* Frosted glass card */}
      <div className="relative z-10 w-full max-w-xl bg-white/80 
      backdrop-blur-xl border border-white/30 shadow-xl rounded-2xl p-12">

        <h1 className="text-3xl font-semibold text-gray-900 mb-10">
          Create your account
        </h1>

        {error && (
          <p className="text-red-600 mb-4 text-sm p-2 bg-red-100 border border-red-300 rounded-md">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* FIRST + LAST NAME */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FloatingInput
              label="First name"
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
            />

            <FloatingInput
              label="Last name"
              value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
            />
          </div>

          {/* EMAIL + PHONE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FloatingInput
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />

            <FloatingInput
              label="Phone number"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>

          {/* ROLE SECTION */}
          <div>
            <p className="font-medium text-gray-800">
              Role: <span className="font-semibold">To be assigned</span>
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Admin will review your request and assign a role.
            </p>
          </div>

          {/* PASSWORD FIELDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FloatingInput
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />

            <FloatingInput
              label="Re-type password"
              type="password"
              value={form.rePassword}
              onChange={(e) => handleChange("rePassword", e.target.value)}
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 
            text-white font-semibold py-3.5 rounded-lg shadow-lg 
            transition active:scale-[0.97]"
          >
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}

function FloatingInput({
  label,
  type = "text",
  value,
  onChange,
}: any) {
  const active = value.length > 0;

  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        required
        className="
          peer w-full px-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm 
          focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
          transition outline-none"
      />

      <label
        className={`
          absolute left-4 text-gray-500 pointer-events-none transition-all duration-200
          ${active ? "top-[-10px] text-xs bg-white px-1" : "top-3 text-sm"}
        `}
      >
        {label}
      </label>
    </div>
  );
}
