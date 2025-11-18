import { ReactNode } from "react"

export const AppCard = ({ children }: { children: ReactNode }) => {
    return (
        <div className="
        bg-white p-4 rounded-md shadow-md border border-gray-200">
            {children}
        </div>
    )
}