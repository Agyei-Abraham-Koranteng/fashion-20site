import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
    const { setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 shadow-sm transition-all active:scale-95"
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-110 dark:scale-0 text-amber-500" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-110 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-gray-100 dark:border-slate-800 p-1">
                <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className="rounded-lg cursor-pointer focus:bg-gray-50 dark:focus:bg-slate-800"
                >
                    <Sun className="mr-2 h-4 w-4 text-amber-500" />
                    <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className="rounded-lg cursor-pointer focus:bg-gray-50 dark:focus:bg-slate-800"
                >
                    <Moon className="mr-2 h-4 w-4 text-indigo-400" />
                    <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className="rounded-lg cursor-pointer focus:bg-gray-50 dark:focus:bg-slate-800"
                >
                    <span className="mr-2 h-4 w-4 flex items-center justify-center text-[10px] font-bold">💻</span>
                    <span>System</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
