import { forwardRef, InputHTMLAttributes, ReactNode, useId } from "react";


type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: ReactNode;
  helperText?: ReactNode;
  errorText?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({
  className,
  id,
  label,
  helperText,
  errorText,
  disabled,
  ...inputProps
}: InputProps, ref) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = errorText
    ? `${inputId}-error`
    : helperText
      ? `${inputId}-helper`
      : undefined;
  const classes = [
    "ui-input",
    errorText ? "ui-input--error" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="ui-field">
      {label ? (
        <label className="ui-field__label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        className={classes}
        aria-invalid={errorText ? true : undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        {...inputProps}
      />
      {errorText ? (
        <p id={`${inputId}-error`} className="ui-field__message ui-field__message--error">
          {errorText}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="ui-field__message">
          {helperText}
        </p>
      ) : null}
    </div>
  );

});
