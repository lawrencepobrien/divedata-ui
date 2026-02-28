import React, { FC, InputHTMLAttributes, useId } from 'react';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id?: string;
}

const TextInput: FC<TextInputProps> = ({ label, id, ...props }) => {
  const generatedId = useId();
  const resolvedId = id ?? generatedId;

  return (
    <div className="form-field">
      <label htmlFor={resolvedId}>{label}</label>
      <input id={resolvedId} type="text" {...props} />
    </div>
  );
};

export default TextInput;