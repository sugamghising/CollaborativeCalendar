import React from 'react'

const Login = () => {
  return (
     <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-[512px]  py-5 max-w-[960px] flex-1">
            <h2 className="text-[#0e1a13] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">Welcome back</h2>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0e1a13] text-base font-medium leading-normal pb-2">Email</p>
                <input
                  placeholder="Email"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e1a13] focus:outline-0 focus:ring-0 border border-[#d1e6d9] bg-[#f8fbfa] focus:border-[#d1e6d9] h-14 placeholder:text-[#51946b] p-[15px] text-base font-normal leading-normal"
                  value=""
                />
              </label>
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0e1a13] text-base font-medium leading-normal pb-2">Password</p>
                <input
                  placeholder="Password"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e1a13] focus:outline-0 focus:ring-0 border border-[#d1e6d9] bg-[#f8fbfa] focus:border-[#d1e6d9] h-14 placeholder:text-[#51946b] p-[15px] text-base font-normal leading-normal"
                  value=""
                />
              </label>
            </div>
            <p className="text-[#51946b] text-sm font-normal leading-normal pb-3 pt-1 px-4 underline">Forgot Password?</p>
            <div className="flex items-center gap-4  px-4 min-h-14 justify-between">
              <p className="text-[#0e1a13] text-base font-normal leading-normal flex-1 truncate">Remember me</p>
              <div className="shrink-0">
                <div className="flex size-7 items-center justify-center">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-[#d1e6d9] border-2 bg-transparent text-[#38e078] checked:bg-[#38e078] checked:border-[#38e078] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#d1e6d9] focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex px-4 py-3">
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 flex-1 bg-[#38e078] text-[#0e1a13] text-base font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">Log in</span>
              </button>
            </div>
            <p className="text-[#51946b] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center underline">Don't have an account? Sign up</p>
          </div>
        </div>
  )
}

export default Login