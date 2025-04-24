import { createPortal } from "react-dom"
import "./EditStatusModal.css"
import { useState } from "react"

const EditStatusModal = ({ isOpen, onClose, account, onStatusChange }) => {
    const [selectedStatus, setSelectedStatus] = useState(account.status)

    if (!isOpen) return null;

    const handleStatusSelect = (newStatus) => {
        setSelectedStatus(newStatus)
    }

    const handleSave = () => {
        onStatusChange(selectedStatus)
        onClose()
    }

    const handleCancel = () => {
        setSelectedStatus(account.status)
        onClose()
    }

    const modalContent = (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{account.title}</h3>
                    <button className="close-button" onClick={handleCancel}>×</button>
                </div>

                <div className="status-options">
                    <button
                        className={`status-option ${selectedStatus === 'draft' ? 'active' : ''}`}
                        onClick={() => handleStatusSelect('draft')}
                    >
                        <div className="status-dot draft"></div>
                        <span>Draft</span>
                    </button>

                    <button
                        className={`status-option ${selectedStatus === 'active' ? 'active' : ''}`}
                        onClick={() => handleStatusSelect('active')}
                    >
                        <div className="status-dot active"></div>
                        <span>Active</span>
                    </button>

                    <button
                        className="status-option delete"
                        onClick={() => handleStatusSelect('delete')}
                    >
                        <div className="status-dot delete"></div>
                        <span>Delete</span>
                    </button>
                </div>

                <div className="modal-footer">
                    <button className="modal-button cancel" onClick={handleCancel}>
                        Cancel
                    </button>
                    <button
                        className="modal-button save"
                        onClick={handleSave}
                        disabled={selectedStatus === account.status}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )

    return createPortal(modalContent, document.body)
}

export default EditStatusModal 