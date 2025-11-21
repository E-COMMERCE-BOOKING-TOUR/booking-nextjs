import { Field, Input } from "@chakra-ui/react"

export const InputUser = ({ label, placeholder, isRequired, helperText }: { label?: string, placeholder: string, isRequired?: boolean, helperText?: string }) => {
    return <Field.Root required={isRequired}>
        {label && (
            <Field.Label>
                {label} <Field.RequiredIndicator />
            </Field.Label>
        )}
        <Input placeholder={placeholder} />
        {helperText && <Field.HelperText>{helperText}</Field.HelperText>}
    </Field.Root>
}