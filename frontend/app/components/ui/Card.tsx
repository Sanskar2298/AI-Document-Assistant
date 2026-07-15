import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
}

/**
 * Card — wraps the existing .glass-card / .glass-card-hover classes
 * (already defined in globals.css) so every panel in the app uses the
 * same padding scale and border treatment instead of each component
 * hardcoding "glass-card p-6 sm:p-8" individually.
 */
export default function Card({ children, hoverable = false, className = "", ...rest }: CardProps) {
  return (
    <div className={`glass-card ${hoverable ? "glass-card-hover" : ""} p-6 sm:p-8 ${className}`} {...rest}>
      {children}
    </div>
  );
}