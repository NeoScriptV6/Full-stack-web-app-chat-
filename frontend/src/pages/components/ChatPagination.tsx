import React from "react";

type ChatPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function ChatPagination({ currentPage, totalPages, onPageChange }: ChatPaginationProps) {
  return (
    <div className="d-flex align-items-center mx-3">
      <button
        className="btn btn-outline-secondary btn-sm"
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
        style={{ minWidth: 32 }}
      >
        <i className="bi bi-arrow-left"></i>
      </button>
      <input
        type="text"
        value={totalPages === 0 ? 0 : currentPage + 1}
        readOnly
        className="form-control text-center mx-2"
        style={{ width: 40, padding: "2px 0", fontSize: 14 }}
      />
      <span style={{ fontSize: 13, color: "#888" }}>/ {totalPages}</span>
      <button
        className="btn btn-outline-secondary btn-sm ms-2"
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
        style={{ minWidth: 32 }}
      >
        <i className="bi bi-arrow-right"></i>
      </button>
    </div>
  );
}