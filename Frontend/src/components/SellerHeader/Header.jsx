"use client"

import { useState } from "react"
import { Upload, PlusCircle } from "lucide-react"
import { Link } from "react-router-dom"
import AddAccountModal from "../AddAccountModal/AddAccountModel"
import "./SellerHeader.css"

const Header = ({ title }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const openModal = () => {
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
    }

    return (
        <div className="pt-header">
            <h1 className="pt-header__title">{title}</h1>
            <div className="pt-header__actions">
                {title === "Accounts" && (
                    <>
                        <Link to="/seller-dashboard/account-imports" className="pt-btn pt-btn--secondary">
                            <Upload size={16} />
                            <span>Account Imports</span>
                        </Link>
                        <button className="pt-btn pt-btn--primary" onClick={openModal}>
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
