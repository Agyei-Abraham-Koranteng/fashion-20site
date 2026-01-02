import { createContext, useContext, useEffect, useState } from "react";

type Theme = {
    primaryColor: string;
    fontFamily: string;
    radius: string;
};

type ThemeContextType = {
    theme: Theme;
    updateTheme: (newTheme: Partial<Theme>) => void;
    resetTheme: () => void;
};

const defaultTheme: Theme = {
    primaryColor: "217 32% 17%", // Default independent navy
    fontFamily: "'Inter', sans-serif",
    radius: "0.5rem",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem("site-theme");
        return saved ? JSON.parse(saved) : defaultTheme;
    });

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty("--primary", theme.primaryColor);
        // Also update ring and other derived colors if needed, 
        // but typically they track primary or are distinct.
        // For now we assume typical shadcn usage where --ring often matches primary.
        root.style.setProperty("--ring", theme.primaryColor);

        root.style.setProperty("--radius", theme.radius);

        // For font, we update the body style
        document.body.style.fontFamily = theme.fontFamily;

        localStorage.setItem("site-theme", JSON.stringify(theme));
    }, [theme]);

    const updateTheme = (newTheme: Partial<Theme>) => {
        setTheme((prev) => ({ ...prev, ...newTheme }));
    };

    const resetTheme = () => {
        setTheme(defaultTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
