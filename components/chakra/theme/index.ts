import {
    createSystem,
    defaultConfig,
    defineConfig,
} from "@chakra-ui/react"

const config = defineConfig({
    theme: {
        tokens: {
            colors: {
                main: {
                   value: "#003B95"
                },
                secondary: {
                    value: "#4DC9E6"
                },
                tertiary: {
                    value: "#1e3a5f"
                }
            },
            sizes: {
                xl: {
                    value: "1300px",
                },
                "2xl": {
                    value: "1400px",
                },
            },
        },
    },
    strictTokens: true,
})

const system = createSystem(defaultConfig, config);

export { system };