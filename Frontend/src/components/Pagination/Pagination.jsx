"use client"
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react"
import "./Pagination.css"

const Pagination = ({ currentPage, totalPages, rowsPerPage, totalRows, onPageChange, onRowsPerPageChange }) => {
    return (
        <div className="pagination">
            <div className="rows-per-page">
                <span>Rows per page</span>
                <select value={rowsPerPage} onChange={(e) => onRowsPerPageChange(Number(e.target.value))}>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                </select>
            </div>

            <div className="pagination-info">
                {totalRows} rows - Page {currentPage} to {totalPages}
            </div>

            <div className="pagination-controls">
                <button className="pagination-btn" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
                    <ChevronFirst size={16} />
                </button>
                <button className="pagination-btn" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                    <ChevronLeft size={16} />
                </button>

                <div className="pagination-pages">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Logic to show pages around current page
                        let pageNum
                        if (totalPages <= 5) {
                            pageNum = i + 1
                        } else if (currentPage <= 3) {
                            pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                        } else {
                            pageNum = currentPage - 2 + i
                        }

                        return (
                            <button
                                key={pageNum}
                                className={`pagination-page ${currentPage === pageNum ? "active" : ""}`}
                                onClick={() => onPageChange(pageNum)}
                            >
                                {pageNum}
                            </button>
                        )
                    })}
                </div>

                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight size={16} />
                </button>
                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronLast size={16} />
                </button>
            </div>
        </div>
    )
}

export default Pagination
