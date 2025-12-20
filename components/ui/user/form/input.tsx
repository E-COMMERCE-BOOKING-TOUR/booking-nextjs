'use client'

import { forwardRef } from "react";
import { Field, Input, InputProps } from "@chakra-ui/react"

interface InputUserProps extends Omit<InputProps, 'label'> {
    label?: string;
    isRequired?: boolean;
    helperText?: string;
    error?: string;
}

export const InputUser = forwardRef<HTMLInputElement, InputUserProps>(
    ({ label, isRequired, helperText, error, ...inputProps }, ref) => {
        return (
            <Field.Root required={isRequired} invalid={!!error}>
                {label && (
                    <Field.Label>
                        {label} {isRequired && <Field.RequiredIndicator />}
                    </Field.Label>
                )}

                <Input ref={ref} {...inputProps} />

                {error && <Field.ErrorText>{error}</Field.ErrorText>}
                {helperText && !error && (
                    <Field.HelperText>{helperText}</Field.HelperText>
                )}
            </Field.Root>
        );
    }
);

InputUser.displayName = "InputUser";
