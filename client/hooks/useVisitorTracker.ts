import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useVisitorTracker() {
    // Use a ref to prevent double-firing in StrictMode during dev
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const visited = sessionStorage.getItem("site_session_active");

        if (!visited) {
            const trackVisit = async () => {
                try {
                    await supabase.from("site_visits").insert([{
                        user_agent: navigator.userAgent,
                        page_path: window.location.pathname
                    }]);
                    sessionStorage.setItem("site_session_active", "true");
                } catch (error) {
                    // Silent fail for tracking
                    console.warn("Visitor tracking failed:", error);
                }
            };
            trackVisit();
        }
    }, []);
}
