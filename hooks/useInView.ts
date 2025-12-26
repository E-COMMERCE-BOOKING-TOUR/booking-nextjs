import { useEffect, useState, useRef } from "react";

export function useInView(options?: IntersectionObserverInit) {
    const ref = useRef<HTMLDivElement>(null); // Limit to Div or generic Element
    const [inView, setInView] = useState(false);
    const [entry, setEntry] = useState<IntersectionObserverEntry>();

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setInView(entry.isIntersecting);
            setEntry(entry);
        }, options);

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [options]);

    return { ref, inView, entry };
}
