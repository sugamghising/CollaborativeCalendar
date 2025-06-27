import React, { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

function Button({ children, className = "", onClick, ...props }: ButtonProps) {
  return (
    <button
      className={`bg-primary-blue ... ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
export default Button;
