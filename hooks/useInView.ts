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

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [options]);

    return { ref, inView, entry };
}
