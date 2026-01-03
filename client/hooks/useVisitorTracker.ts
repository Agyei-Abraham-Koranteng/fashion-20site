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
                const userAgent = navigator.userAgent;
                const path = window.location.pathname;

                console.log(`[VisitorTracker] Initializing session... (Path: ${path})`);

                try {
                    const { error } = await supabase.from("site_visits").insert([{
                        user_agent: userAgent,
                        page_path: path
                    }]);

                    if (error) {
                        console.warn("[VisitorTracker] Failed to record visit:", error.message);
                    } else {
                        console.log("[VisitorTracker] Visit recorded successfully.");
                        sessionStorage.setItem("site_session_active", "true");
                    }
                } catch (error) {
                    console.warn("[VisitorTracker] Unexpected error during tracking:", error);
                }
            };
            trackVisit();
        }
    }, []);
}
