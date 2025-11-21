'use client'
import { Field, Input } from "@chakra-ui/react"

export const InputUser = ({ label, placeholder, isRequired, helperText, value, onChange }: { label?: string, placeholder: string, isRequired?: boolean, helperText?: string, value?: string, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
    return <Field.Root required={isRequired}>
        {label && (
            <Field.Label>
                {label} <Field.RequiredIndicator />
            </Field.Label>
        )}
        <Input placeholder={placeholder} value={value} onChange={onChange || undefined} />
        {helperText && <Field.HelperText>{helperText}</Field.HelperText>}
    </Field.Root>
}