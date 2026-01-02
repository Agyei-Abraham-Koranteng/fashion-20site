import { createContext, useContext, useEffect, useState } from "react";

type Theme = {
    primaryColor: string;
    fontFamily: string;
    radius: string;
    mode: 'light' | 'dark';
};

type ThemeContextType = {
    theme: Theme;
    updateTheme: (newTheme: Partial<Theme>) => void;
    resetTheme: () => void;
    toggleMode: () => void;
};

const defaultTheme: Theme = {
    primaryColor: "217 32% 17%", // Default independent navy
    fontFamily: "'Inter', sans-serif",
    radius: "0.5rem",
    mode: 'light',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem("site-theme");
        return saved ? { ...defaultTheme, ...JSON.parse(saved) } : defaultTheme;
    });

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty("--primary", theme.primaryColor);
        root.style.setProperty("--ring", theme.primaryColor);
        root.style.setProperty("--radius", theme.radius);
        document.body.style.fontFamily = theme.fontFamily;

        // Handle Dark Mode
        if (theme.mode === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        localStorage.setItem("site-theme", JSON.stringify(theme));
    }, [theme]);

    const updateTheme = (newTheme: Partial<Theme>) => {
        setTheme((prev) => ({ ...prev, ...newTheme }));
    };

    const toggleMode = () => {
        setTheme((prev) => ({ ...prev, mode: prev.mode === 'light' ? 'dark' : 'light' }));
    };

    const resetTheme = () => {
        setTheme(defaultTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, updateTheme, resetTheme, toggleMode }}>
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
