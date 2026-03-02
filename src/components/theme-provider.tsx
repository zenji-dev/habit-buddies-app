import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

type ThemeProviderState = {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "vite-ui-theme",
    ...props
}: ThemeProviderProps) {
    // Always follow system preference. Ignore stored/user overrides.
    const [theme] = useState<Theme>(() => "system")

    useEffect(() => {
        const root = window.document.documentElement

        const applySystem = () => {
            root.classList.remove("light", "dark")
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light"
            root.classList.add(systemTheme)
        }

        applySystem()

        const mq = window.matchMedia("(prefers-color-scheme: dark)")
        const handler = () => applySystem()
        if (mq.addEventListener) mq.addEventListener("change", handler)
        else mq.addListener(handler)

        return () => {
            if (mq.removeEventListener) mq.removeEventListener("change", handler)
            else mq.removeListener(handler)
        }
    }, [])

    const value = {
        theme,
        setTheme: (_: Theme) => {
            // no-op: theme is forced to system
        },
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}
