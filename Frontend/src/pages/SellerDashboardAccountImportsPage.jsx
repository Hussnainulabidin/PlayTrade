"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Header from "../components/SellerHeader/Header"
import LoadingState from "../components/LoadingState/LoadingState"
import ErrorState from "../components/ErrorState/ErrorState"
import "./SellerDashboardAccountImportsPage.css"

const SellerDashboardImportsPage = () => {
    const [imports, setImports] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchImports = async () => {
            try {
                setLoading(true)
                const response = await axios.get("http://localhost:3003/accounts/getImports")
                setImports(response.data.data)
            } catch (err) {
                setError("Failed to fetch account imports")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchImports()
    }, [])

    if (loading) return <LoadingState message="Loading account imports..." />
    if (error) return <ErrorState message={error} />

    return (
        <div className="seller-dashboard-imports-page">
            <Header title="Account Imports" />
            <div className="imports-container">
                {/* Account imports content will go here */}
                <div className="imports-placeholder">Account imports functionality will be implemented here</div>
            </div>
        </div>
    )
}

export default SellerDashboardImportsPage
