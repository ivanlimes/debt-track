import { ReactNode, SelectHTMLAttributes, useId } from "react";

type SelectOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  label?: ReactNode;
  helperText?: ReactNode;
  errorText?: ReactNode;
  options: SelectOption[];
};

export function Select({
  className,
  id,
  label,
  helperText,
  errorText,
  options,
  ...selectProps
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const describedBy = errorText
    ? `${selectId}-error`
    : helperText
      ? `${selectId}-helper`
      : undefined;

  const classes = [
    "ui-input",
    "ui-select",
    errorText ? "ui-input--error" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="ui-field">
      {label ? (
        <label className="ui-field__label" htmlFor={selectId}>
          {label}
        </label>
      ) : null}
      <div className="ui-select__wrap">
        <select id={selectId} className={classes} aria-invalid={errorText ? true : undefined} aria-describedby={describedBy} {...selectProps}>
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="ui-select__icon" aria-hidden="true">
          ▾
        </span>
      </div>
      {errorText ? (
        <p id={`${selectId}-error`} className="ui-field__message ui-field__message--error">
          {errorText}
        </p>
      ) : helperText ? (
        <p id={`${selectId}-helper`} className="ui-field__message">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
