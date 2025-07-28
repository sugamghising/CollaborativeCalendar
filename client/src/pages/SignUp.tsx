import React from 'react'

const SignUp = () => {
  return (
    <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-[512px] max-w-[960px] py-5 flex-1">

            <h2 className="text-[#101913] tracking-light text-[28px] font-bold leading-tight px-4 text-left pb-3 pt-5">Sign up for EventSync</h2>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <input
                  placeholder="Email"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101913] focus:outline-0 focus:ring-0 border-none bg-[#e9f1ec] focus:border-none h-14 placeholder:text-[#5a8c6d] p-4 text-base font-normal leading-normal"
                  value=""
                />
              </label>
            </div>
            <div className="flex px-4 py-3 justify-start">
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#94e0b1] text-[#101913] text-sm font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">Continue</span>
              </button>
            </div>
            <p className="text-[#5a8c6d] text-sm font-normal leading-normal pb-3 pt-1 px-4 underline">Already have an account? Sign in</p>
          </div>
        </div>
  )
}

export default SignUp