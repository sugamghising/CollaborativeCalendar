import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { forgotPasswordcodeVerify } from '../services/authService';

const VerifyResetCode = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get('email') || '';

  // Redirect to forgot password if no email is present
  React.useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('No email provided. Please start the password reset process again.');
      navigate('/forgot-password');
      return;
    }
    
    if (!code) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await forgotPasswordcodeVerify(email, code);
      if (response && response.token) {
        navigate(`/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`);
      } else {
        setError('Invalid verification code');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.response?.data?.message || 'Invalid verification code');
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col w-full md:w-[512px] py-5 max-w-[960px] flex-1">
        <h2 className="text-[#0e1a13] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
          Verify Your Email
        </h2>
        
        <p className="text-[#0e1a13] text-base font-normal leading-normal px-4 text-center pb-6">
          We've sent a verification code to {email}. Please enter it below.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#0e1a13] text-base font-medium leading-normal pb-2">Verification Code</p>
              <input
                type="text"
                placeholder="Enter verification code"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e1a13] focus:outline-0 focus:ring-0 border border-[#d1e6d9] bg-[#f8fbfa] focus:border-[#38e078] h-14 placeholder:text-[#51946b] p-[15px] text-base font-normal leading-normal"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="flex px-4 py-6">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center items-center w-full px-6 py-3 bg-[#38e078] hover:bg-[#2bc76c] text-white text-base font-medium leading-normal rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyResetCode;
