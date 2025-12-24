import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface CustomPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function CustomPagination({
    currentPage,
    totalPages,
    onPageChange,
}: CustomPaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <Pagination className="justify-end mt-4">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) onPageChange(currentPage - 1);
                        }}
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>

                {/* Simple logic for pagination numbers, can be improved for large number of pages */}
                {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Show first, last, current, and adjacent pages
                    if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                        return (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    href="#"
                                    isActive={page === currentPage}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onPageChange(page);
                                    }}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    } else if (
                        (page === currentPage - 2 && page > 2) ||
                        (page === currentPage + 2 && page < totalPages - 1)
                    ) {
                        return <PaginationItem key={page}><PaginationEllipsis /></PaginationItem>;
                    }
                    return null;
                })}

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) onPageChange(currentPage + 1);
                        }}
                        className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
