"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import axios from "axios"
import "./CreateTicket.css"

function SellerDashboardCreateTicketPage() {
    const navigate = useNavigate()
    const [ticketType, setTicketType] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const ticketTypes = [
        { value: "Rating Issue", label: "Rating Issue" },
        { value: "Order Issue", label: "Order Issue" },
        { value: "Marketplace Issue", label: "Marketplace Issue" },
        { value: "Client Ticket", label: "Client Ticket" }
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!ticketType) {
            setError("Please select a ticket type")
            return
        }

        try {
            setLoading(true)
            setError(null)

            const response = await axios.post("http://localhost:3003/tickets", {
                ticketType
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (response.data.status === 'success') {
                // Navigate to the ticket detail page
                navigate(`/seller-tickets/${response.data.data.ticket._id}`)
            }
        } catch (err) {
            console.error("Error creating ticket:", err)
            setError(err.response?.data?.message || "Failed to create ticket. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="create-ticket-container">
            <div className="create-ticket-header">
                <button
                    className="back-button"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={20} />
                    Back
                </button>
                <h1 className="create-ticket-title">Create New Ticket</h1>
            </div>

            <div className="create-ticket-content">
                <form onSubmit={handleSubmit} className="create-ticket-form">
                    <div className="form-group">
                        <label htmlFor="ticketType" className="form-label">
                            Select Ticket Type
                        </label>
                        <select
                            id="ticketType"
                            value={ticketType}
                            onChange={(e) => setTicketType(e.target.value)}
                            className="form-select"
                            disabled={loading}
                        >
                            <option value="">Choose a ticket type</option>
                            {ticketTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? "Creating Ticket..." : "Create Ticket"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default SellerDashboardCreateTicketPage 