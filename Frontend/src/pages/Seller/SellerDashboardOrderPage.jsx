"use client"

import { useState, useEffect } from "react"
import { userApi, orderApi } from "../../api"
import Header from "../../components/SellerDashboard/SellerHeader/Header"
import OrdersTable from "../../components/SellerDashboard/OrdersTable/OrdersTable"
import OrderFilterBar from "../../components/SellerDashboard/OrderFilterBar/OrderFilterBar"
import Pagination from "../../components/Pagination/Pagination"
import LoadingState from "../../components/LoadingState/LoadingState"
import ErrorState from "../../components/ErrorState/ErrorState"
import "./SellerDashboardOrderPage.css"

const SellerDashboardOrderPage = () => {
    const [orders, setOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
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

    // Main data fetching effect - get orders directly from the backend
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true)
                // First get the seller ID from the backend
                const userResponse = await userApi.getMe();
                const sellerId = userResponse.data.data._id;

                console.log("Seller ID:", sellerId);

                // Get orders directly from the API
                const orderResponse = await orderApi.getOrdersBySellerId(sellerId);
                const sellerOrders = orderResponse.data.data;

                console.log("Seller orders:", sellerOrders);

                if (sellerOrders && sellerOrders.length > 0) {
                    // Get full details for each order
                    const orderPromises = sellerOrders.map(async (orderSummary) => {
                        try {
                            const orderDetailResponse = await orderApi.getOrderById(orderSummary.id);
                            const orderDetail = orderDetailResponse.data.data;

                            // Format the order for display
                            return {
                                ...orderDetail,
                                _id: orderDetail.id, // Ensure _id is available for component props
                                title: orderDetail.account?.title || "Unknown Account",
                                gameType: orderDetail.game || "Unknown Game",
                                buyer: orderDetail.buyer,
                                status: orderDetail.status,
                                price: orderDetail.payment?.orderPrice || 0,
                                createdAt: orderDetail.createdAt
                            };
                        } catch (detailError) {
                            console.error(`Failed to get details for order ${orderSummary.id}`, detailError);
                            // Return a simpler version if we can't get detailed info
                            return {
                                _id: orderSummary.id,
                                title: "Account #" + orderSummary.id.slice(-6),
                                gameType: orderSummary.gameType || "Unknown",
                                buyer: { username: "Unknown Buyer" },
                                status: orderSummary.status,
                                price: orderSummary.amount || 0,
                                createdAt: orderSummary.date || new Date()
                            };
                        }
                    });

                    const orderDetails = await Promise.all(orderPromises);
                    console.log("Order details:", orderDetails);

                    setOrders(orderDetails);
                    setTotalRows(orderDetails.length);
                    setTotalPages(Math.ceil(orderDetails.length / rowsPerPage));
                } else {
                    // No orders found
                    setOrders([]);
                    setTotalRows(0);
                    setTotalPages(0);
                }
            } catch (err) {
                setError("Failed to fetch orders");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [rowsPerPage]);

    // Helper function to get order date
    const getOrderDate = (order) => {
        const dateStr = order.createdAt || null;

        if (!dateStr) return null;

        // Convert to Date object, handling potential invalid dates
        try {
            return new Date(dateStr);
        } catch (err) {
            console.error(`Invalid date for order ${order._id}:`, dateStr);
            return null;
        }
    };

    // Apply filters and search effect 
    useEffect(() => {
        // If data hasn't loaded yet, don't filter
        if (loading) return;

        // Filter orders based on search and filters
        const filtered = orders.filter(order => {
            // Search filter (case insensitive)
            const matchesSearch = !searchQuery ||
                order.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.gameType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.buyer?.username?.toLowerCase().includes(searchQuery.toLowerCase());

            // Game filter
            const matchesGame = filters.games.length === 0 ||
                filters.games.includes(order.gameType);

            // Status filter - check lowercase values
            const matchesStatus = filters.statuses.length === 0 ||
                filters.statuses.includes(order.status.toLowerCase());

            // Date filter
            let matchesDate = true;
            if (filters.startDate || filters.endDate) {
                const orderDate = getOrderDate(order);

                // If we can't determine the order date, don't filter it out
                if (!orderDate) return true;

                if (filters.startDate) {
                    const startDate = new Date(filters.startDate);
                    startDate.setHours(0, 0, 0, 0); // Start of day
                    matchesDate = orderDate >= startDate;
                }

                if (filters.endDate && matchesDate) {
                    const endDate = new Date(filters.endDate);
                    endDate.setHours(23, 59, 59, 999); // End of day
                    matchesDate = orderDate <= endDate;
                }
            }

            // All conditions must be true
            return matchesSearch && matchesGame && matchesStatus && matchesDate;
        });

        setFilteredOrders(filtered);

        // Update pagination based on filtered results
        const newTotalRows = filtered.length;
        setTotalRows(newTotalRows);
        setTotalPages(Math.ceil(newTotalRows / rowsPerPage));

    }, [orders, searchQuery, filters, rowsPerPage]);

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
        return filteredOrders.slice(startIndex, endIndex);
    };

    if (loading) return <LoadingState message="Loading orders..." />
    if (error) return <ErrorState message={error} />

    return (
        <div className="seller-dashboard-orders-page">
            <Header title="Orders" />
            <div className="orders-container">
                <OrderFilterBar
                    className="filter-bar"
                    onSearch={handleSearch}
                    onFilterChange={handleFilterChange}
                    searchQuery={searchQuery}
                    filters={filters}
                />
                <div className="table-container">
                    <OrdersTable orders={getCurrentPageItems()} />
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

export default SellerDashboardOrderPage
