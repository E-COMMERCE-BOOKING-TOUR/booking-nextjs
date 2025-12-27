"use client"

import { ChakraProvider } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"
import { system } from "./theme"

export function Provider(props: ColorModeProviderProps) {
  const { children, ...rest } = props
  return (
    <ColorModeProvider {...rest}>
      <ChakraProvider value={system}>
        {children}
      </ChakraProvider>
    </ColorModeProvider>
  )
}
