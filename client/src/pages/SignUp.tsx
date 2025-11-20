import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"email" | "verify" | "complete">("email");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { signup, verifyEmail, completeSignup } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    setIsLoading(true);
    try {
      // Call signup to send verification code
      await signup(email, name, "");
      // Move to verification step
      navigate("/verify-email", {
        replace: true,
        state: {
          email: email,
          message: "We've sent a verification code to your email.",
        },
      });
    } catch (err: any) {
      setError(err.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!verificationCode) {
      setError("Please enter the verification code");
      return;
    }

    setIsLoading(true);
    try {
      const token = await verifyEmail(email, verificationCode);
      // Store the token temporarily for the complete signup step
      localStorage.setItem("signup_token", token);
      setStep("complete");
    } catch (err: any) {
      setError(err.message || "Failed to verify code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (name.length < 3) {
      setError("Name must be three letter at least");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    const token = localStorage.getItem("signup_token");
    if (!token) {
      setError("Session expired. Please start over.");
      setStep("email");
      return;
    }

    setIsLoading(true);
    try {
      await completeSignup(name, password, token);
      localStorage.removeItem("signup_token");
      navigate("/calendar");
    } catch (err: any) {
      setError(err.message || "Failed to complete signup");
    } finally {
      setIsLoading(false);
      navigate("/calendar");
    }
  };

  const renderEmailStep = () => (
    <>
      <h2 className="text-[#101913] tracking-light text-[28px] font-bold leading-tight px-4 text-left pb-3 pt-5">
        Sign up for EventSync
      </h2>
      {error && (
        <div className="mb-4 mx-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleEmailSubmit}>
        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <input
              type="email"
              placeholder="Email"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101913] focus:outline-0 focus:ring-0 border border-[#d1e6d9] bg-[#f8fbfa] focus:border-[#38e078] h-14 placeholder:text-[#5a8c6d] p-4 text-base font-normal leading-normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="flex px-4 py-3 justify-start">
          <button
            type="submit"
            disabled={isLoading}
            className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 flex-1 ${
              isLoading ? "bg-[#94e0b1]" : "bg-[#38e078] hover:bg-[#2fc767]"
            } text-[#0e1a13] text-base font-bold leading-normal tracking-[0.015em] transition-colors`}
          >
            {isLoading ? "Sending code..." : "Continue"}
          </button>
        </div>
      </form>
      <p className="text-[#5a8c6d] text-sm font-normal leading-normal pb-3 pt-1 px-4">
        Already have an account?{" "}
        <Link
          to="/login"
          className="underline hover:text-[#38e078] transition-colors"
        >
          Sign in
        </Link>
      </p>
    </>
  );

  const renderVerificationStep = () => (
    <>
      <h2 className="text-[#101913] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
        Verify your email
      </h2>
      <p className="text-[#5a8c6d] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
        We've sent a verification code to {email}
      </p>
      {error && (
        <div className="mb-4 mx-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleVerificationSubmit}>
        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <input
              type="text"
              placeholder="Verification code"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101913] focus:outline-0 focus:ring-0 border border-[#d1e6d9] bg-[#f8fbfa] focus:border-[#38e078] h-14 placeholder:text-[#5a8c6d] p-4 text-base font-normal leading-normal text-center tracking-widest"
              value={verificationCode}
              onChange={(e) =>
                setVerificationCode(e.target.value.replace(/\D/g, ""))
              }
              maxLength={6}
              required
            />
          </label>
        </div>
        <div className="flex px-4 py-3 justify-start">
          <button
            type="submit"
            disabled={isLoading}
            className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 flex-1 ${
              isLoading ? "bg-[#94e0b1]" : "bg-[#38e078] hover:bg-[#2fc767]"
            } text-[#0e1a13] text-base font-bold leading-normal tracking-[0.015em] transition-colors`}
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </button>
        </div>
      </form>
      <p className="text-[#5a8c6d] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
        Didn't receive a code?{" "}
        <button
          onClick={handleEmailSubmit}
          className="underline hover:text-[#38e078] transition-colors"
          disabled={isLoading}
        >
          Resend code
        </button>
      </p>
    </>
  );

  const renderCompleteStep = () => (
    <>
      <h2 className="text-[#101913] tracking-light text-[28px] font-bold leading-tight px-4 text-left pb-3 pt-5">
        Complete your profile
      </h2>
      {error && (
        <div className="mb-4 mx-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleCompleteSignup}>
        <div className="flex max-w-[480px] flex-wrap gap-4 px-4 py-3">
          <label className="flex flex-col w-full">
            <span className="text-[#101913] text-base font-medium leading-normal pb-2">
              Full Name
            </span>
            <input
              type="text"
              placeholder="Your name"
              className="form-input w-full rounded-xl text-[#101913] focus:outline-0 focus:ring-0 border border-[#d1e6d9] bg-[#f8fbfa] focus:border-[#38e078] h-14 placeholder:text-[#5a8c6d] p-4 text-base font-normal leading-normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col w-full">
            <span className="text-[#101913] text-base font-medium leading-normal pb-2">
              Password
            </span>
            <input
              type="password"
              placeholder="Create a password"
              className="form-input w-full rounded-xl text-[#101913] focus:outline-0 focus:ring-0 border border-[#d1e6d9] bg-[#f8fbfa] focus:border-[#38e078] h-14 placeholder:text-[#5a8c6d] p-4 text-base font-normal leading-normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col w-full">
            <input
              type="password"
              placeholder="Confirm password"
              className="form-input w-full rounded-xl text-[#101913] focus:outline-0 focus:ring-0 border border-[#d1e6d9] bg-[#f8fbfa] focus:border-[#38e078] h-14 placeholder:text-[#5a8c6d] p-4 text-base font-normal leading-normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="px-4 py-3">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 ${
              isLoading ? "bg-[#94e0b1]" : "bg-[#38e078] hover:bg-[#2fc767]"
            } text-[#0e1a13] text-base font-bold leading-normal tracking-[0.015em] transition-colors`}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </div>
      </form>
    </>
  );

  return (
    <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col w-full md:w-[512px] max-w-[960px] py-5 flex-1">
        {step === "email" && renderEmailStep()}
        {step === "verify" && renderVerificationStep()}
        {step === "complete" && renderCompleteStep()}
      </div>
    </div>
  );
};

export default SignUp;
