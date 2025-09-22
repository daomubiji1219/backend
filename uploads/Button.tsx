import React, { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { StyledButton, StyledSpinner, IconContainer } from './Button.styled';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <StyledButton
        ref={ref}
        type={type}
        variant={variant}
        size={size}
        fullWidth={props.fullWidth}
        disabled={loading || disabled}
        {...props}
      >
        {loading && <StyledSpinner size={size} />}
        {icon && <IconContainer hasChildren={!!children}>{icon}</IconContainer>}
        {children}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';

export type { ButtonProps };
export default Button;
