import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const { login, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any previous errors when the component mounts
    clearError?.();
    setLocalError("");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/calendar");
    } catch (err: any) {
      setLocalError(err.message || "Failed to log in");
      console.log("ERRORORORORO", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Combine local and auth context errors
  const errorMessage = localError || authError || "";

  return (
    <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col w-full md:w-[512px] py-5 max-w-[960px] flex-1">
        <h2 className="text-[#0e1a13] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
          Welcome back
        </h2>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#0e1a13] text-base font-medium leading-normal pb-2">
                Email
              </p>
              <input
                type="email"
                placeholder="Email"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e1a13] focus:outline-0 focus:ring-0 border border-[#d1e6d9] bg-[#f8fbfa] focus:border-[#38e078] h-14 placeholder:text-[#51946b] p-[15px] text-base font-normal leading-normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#0e1a13] text-base font-medium leading-normal pb-2">
                Password
              </p>
              <input
                type="password"
                placeholder="Password"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e1a13] focus:outline-0 focus:ring-0 border border-[#d1e6d9] bg-[#f8fbfa] focus:border-[#38e078] h-14 placeholder:text-[#51946b] p-[15px] text-base font-normal leading-normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="flex justify-end px-4">
            <Link
              to="/forgot-password"
              className="text-[#51946b] text-sm font-normal leading-normal pb-3 pt-1 underline hover:text-[#38e078] transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="flex items-center gap-4 px-4 min-h-14 justify-between">
            <p className="text-[#0e1a13] text-base font-normal leading-normal flex-1 truncate">
              Remember me
            </p>
            <div className="shrink-0">
              <div className="flex size-7 items-center justify-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-5 w-5 rounded border-[#d1e6d9] border-2 bg-transparent text-[#38e078] checked:bg-[#38e078] checked:border-[#38e078] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#38e078] focus:outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex px-4 py-3">
            <button
              type="submit"
              disabled={isLoading}
              className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 flex-1 ${
                isLoading ? "bg-[#94e0b1]" : "bg-[#38e078] hover:bg-[#2fc767]"
              } text-[#0e1a13] text-base font-bold leading-normal tracking-[0.015em] transition-colors`}
            >
              {isLoading ? "Logging in..." : "Log in"}
            </button>
          </div>
        </form>

        <p className="text-[#51946b] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="underline hover:text-[#38e078] transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
