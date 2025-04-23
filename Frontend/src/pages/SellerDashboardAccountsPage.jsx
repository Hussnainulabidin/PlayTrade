"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Header from "../components/SellerHeader/Header"
import AccountsTable from "../components/AccountsTable/AccountsTable"
import FilterBar from "../components/FilterBar/FilterBar"
import Pagination from "../components/Pagination/Pagination"
import LoadingState from "../components/LoadingState/LoadingState"
import ErrorState from "../components/ErrorState/ErrorState"
import "./SellerDashboardAccountsPage.css"

const SellerDashboardAccountsPage = () => {
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(15)
    const [totalRows, setTotalRows] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState({
        game: null,
        status: null,
        rating: null,
        server: null,
        featured: null,
        discounted: null,
        date: null,
    })

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                setLoading(true)
                // First get the seller ID from the backend
                const sellerResponse = await axios.get("http://localhost:3003/users/me")
                const sellerId = sellerResponse.data.data._id

                // Then fetch accounts using the seller ID
                const response = await axios.get(`http://localhost:3003/gameAccounts/seller/${sellerId}`)
                setAccounts(response.data.data.gameAccounts)
                setTotalRows(response.data.results)
                setTotalPages(Math.ceil(response.data.results / rowsPerPage))
            } catch (err) {
                setError("Failed to fetch accounts")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchAccounts()
    }, [currentPage, rowsPerPage, filters, searchQuery])

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const handleRowsPerPageChange = (rows) => {
        setRowsPerPage(rows)
        setCurrentPage(1) // Reset to first page when changing rows per page
    }

    const handleSearch = (query) => {
        setSearchQuery(query)
        setCurrentPage(1) // Reset to first page when searching
    }

    const handleFilterChange = (filterType, value) => {
        setFilters((prev) => ({
            ...prev,
            [filterType]: value,
        }))
        setCurrentPage(1) // Reset to first page when filtering
    }

    if (loading) return <LoadingState message="Loading accounts..." />
    if (error) return <ErrorState message={error} />

    return (
        <div className="seller-dashboard-accounts-page">
            <Header title="Accounts" />
            <div className="accounts-container">
                <FilterBar
                    onSearch={handleSearch}
                    onFilterChange={handleFilterChange}
                    searchQuery={searchQuery}
                    filters={filters}
                />
                <AccountsTable accounts={accounts} />
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    rowsPerPage={rowsPerPage}
                    totalRows={totalRows}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                />
            </div>
        </div>
    )
}

export default SellerDashboardAccountsPage
