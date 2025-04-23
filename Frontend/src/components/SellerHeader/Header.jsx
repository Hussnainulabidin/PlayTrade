"use client"

import { useState } from "react"
import { Upload, PlusCircle } from "lucide-react"
import { Link } from "react-router-dom"
import AddAccountModal from "../AddAccountModal/AddAccountModel"
import "./Header.css"

const Header = ({ title }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const openModal = () => {
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
    }

    return (
        <div className="header">
            <h1 className="header-title">{title}</h1>
            <div className="header-actions">
                {title === "Accounts" && (
                    <>
                        <Link to="/seller-dashboard/account-imports" className="btn btn-secondary">
                            <Upload size={16} />
                            <span>Account Imports</span>
                        </Link>
                        <button className="btn btn-primary" onClick={openModal}>
                            <PlusCircle size={16} />
                            <span>Add New Account</span>
                        </button>
                        <AddAccountModal isOpen={isModalOpen} onClose={closeModal} />
                    </>
                )}
            </div>
        </div>
    )
}

export default Header
