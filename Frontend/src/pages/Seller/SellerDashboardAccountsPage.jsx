"use client"

import { useState, useEffect } from "react"
import API from "../../api"
import userApi from "../../api/userApi"
import Header from "../../components/SellerDashboard/SellerHeader/Header"
import AccountsTable from "../../components/SellerDashboard/AccountsTable/AccountsTable"
import FilterBar from "../../components/SellerDashboard/SellerFilterBar/FilterBar"
import Pagination from "../../components/Pagination/Pagination"
import LoadingState from "../../components/LoadingState/LoadingState"
import ErrorState from "../../components/ErrorState/ErrorState"
import "./SellerDashboardAccountsPage.css"

const SellerDashboardAccountsPage = () => {
    const [accounts, setAccounts] = useState([])
    const [filteredAccounts, setFilteredAccounts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(15)
    const [totalRows, setTotalRows] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState({
        games: [], // Array of selected games
        statuses: [], // Array of selected statuses
        startDate: "",
        endDate: ""
    })

    // Main data fetching effect
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                setLoading(true)
                // First get the seller ID from the backend
                const userResponse = await userApi.getMe();
                const sellerId = userResponse.data.data._id

                // Then fetch accounts using the seller ID
                const response = await API.get(`/gameAccounts/seller/${sellerId}?page=1&limit=100`);
                setAccounts(response.data.data.gameAccounts)
                setTotalRows(response.data.totalAccounts)
                setTotalPages(Math.ceil(response.data.totalAccounts / rowsPerPage))
            } catch (err) {
                setError("Failed to fetch accounts")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchAccounts()
    }, [rowsPerPage])

    // Helper function to get account date
    const getAccountDate = (account) => {
        // Try different date fields, with fallbacks
        const dateStr = account.lastUpdated || account.updatedAt || account.createdAt || null;

        if (!dateStr) return null;

        // Convert to Date object, handling potential invalid dates
        try {
            return new Date(dateStr);
        } catch (err) {
            console.error(`Invalid date for account ${account._id}:`, dateStr);
            return null;
        }
    };

    // Apply filters and search effect 
    useEffect(() => {
        // If data hasn't loaded yet, don't filter
        if (loading) return;

        // Filter accounts based on search and filters
        const filtered = accounts.filter(account => {
            // Search filter (case insensitive)
            const matchesSearch = !searchQuery ||
                account.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                account.gameType?.toLowerCase().includes(searchQuery.toLowerCase());

            // Game filter
            const matchesGame = filters.games.length === 0 ||
                filters.games.includes(account.gameType);

            // Status filter - check lowercase values
            const matchesStatus = filters.statuses.length === 0 ||
                filters.statuses.includes(account.status.toLowerCase());

            // Date filter
            let matchesDate = true;
            if (filters.startDate || filters.endDate) {
                const accountDate = getAccountDate(account);

                // If we can't determine the account date, don't filter it out
                if (!accountDate) return true;

                if (filters.startDate) {
                    const startDate = new Date(filters.startDate);
                    startDate.setHours(0, 0, 0, 0); // Start of day
                    matchesDate = accountDate >= startDate;
                }

                if (filters.endDate && matchesDate) {
                    const endDate = new Date(filters.endDate);
                    endDate.setHours(23, 59, 59, 999); // End of day
                    matchesDate = accountDate <= endDate;
                }
            }

            // All conditions must be true
            return matchesSearch && matchesGame && matchesStatus && matchesDate;
        });

        setFilteredAccounts(filtered);

        // Update pagination based on filtered results
        const newTotalRows = filtered.length;
        setTotalRows(newTotalRows);
        setTotalPages(Math.ceil(newTotalRows / rowsPerPage));

    }, [accounts, searchQuery, filters, rowsPerPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const handleRowsPerPageChange = (rows) => {
        const newRows = parseInt(rows)
        setRowsPerPage(newRows)
        setCurrentPage(1) // Reset to first page when changing rows per page
        setTotalPages(Math.ceil(totalRows / newRows)) // Recalculate total pages
    }

    const handleSearch = (query) => {
        setSearchQuery(query)
        setCurrentPage(1) // Reset to first page when searching
    }

    const handleFilterChange = (newFilters) => {
        console.log("Applying filters:", newFilters);
        setFilters(newFilters)
        setCurrentPage(1) // Reset to first page when filtering
    }

    // Get current page of data
    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return filteredAccounts.slice(startIndex, endIndex);
    };

    if (loading) return <LoadingState message="Loading accounts..." />
    if (error) return <ErrorState message={error} />

    return (
        <div className="seller-dashboard-accounts-page">
            <Header title="Accounts" />
            <div className="accounts-container">
                <FilterBar
                    className="filter-bar"
                    onSearch={handleSearch}
                    onFilterChange={handleFilterChange}
                    searchQuery={searchQuery}
                    filters={filters}
                />
                <div className="table-container">
                    <AccountsTable accounts={getCurrentPageItems()} />
                </div>
                <Pagination
                    className="pagination-container"
                    currentPage={currentPage}
                    totalPages={totalPages}
                    rowsPerPage={rowsPerPage}
                    totalRows={totalRows}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    rowsPerPageOptions={[10, 15, 25, 50]}
                />
            </div>
        </div>
    )
}

export default SellerDashboardAccountsPage
