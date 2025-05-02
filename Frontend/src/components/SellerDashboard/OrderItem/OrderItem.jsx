import { useState, useRef, useEffect } from "react"
import { MoreHorizontal, MessageCircle, Info } from "lucide-react"
import GameIcon from "../../GameIcon/GameIcon"
import { Link } from "react-router-dom"
import "./SellerOrderItem.css"

const OrderItem = ({ order }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
    const dropdownRef = useRef(null)
    const buttonRef = useRef(null)

    const getStatusClass = (status) => {
        return `pt-order-status pt-order-status--${status.toLowerCase()}`
    }

    const truncateTitle = (title) => {
        if (title && title.length > 45) {
            return `${title.substring(0, 45)}...`;
        }
        return title;
    }

    const handleDropdownClick = (e) => {
        e.stopPropagation()

        if (!isDropdownOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            setDropdownPosition({
                top: rect.bottom,
                right: window.innerWidth - rect.right
            })
        }

        setIsDropdownOpen(!isDropdownOpen)
    }

    const formatPrice = (price) => {
        return `$${parseFloat(price).toFixed(2)}`
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isDropdownOpen])

    return (
        <div className="pt-order-item">
            <div className="pt-order-cell--checkbox">
                <input type="checkbox" />
            </div>

            <div className="pt-order-cell--title">
                <div className="pt-order-game-info">
                    <GameIcon game={order.gameType} />
                    <div className="pt-order-title__content">
                        <Link to={`/order/${order._id}`} className="pt-order-title-link">
                            {truncateTitle(order.title)}
                        </Link>
                    </div>
                </div>
            </div>

            <div className="pt-order-cell--order-id">#{order._id.slice(-6)}</div>

            <div className="pt-order-cell--buyer">{order.buyer?.username || "Unknown Buyer"}</div>

            <div className="pt-order-cell--status">
                <span className={getStatusClass(order.status)}>
                    {order.status}
                </span>
            </div>

            <div className="pt-order-cell--price">{formatPrice(order.price)}</div>

            <div className="pt-order-cell--date">{formatDate(order.createdAt)}</div>

            <div className="pt-order-cell--actions" ref={dropdownRef}>
                <button
                    className="pt-order-action-btn"
                    onClick={handleDropdownClick}
                    ref={buttonRef}
                >
                    <MoreHorizontal size={16} />
                </button>
                {isDropdownOpen && (
                    <div
                        className="pt-order-dropdown pt-order-dropdown--outside"
                        style={{
                            top: `${dropdownPosition.top}px`,
                            right: `${dropdownPosition.right}px`
                        }}
                    >
                        <Link to={`/order/${order._id}`} className="pt-order-dropdown__item">
                            <Info size={14} className="pt-order-dropdown__icon" />
                            <span>Order Details</span>
                        </Link>
                        <Link to={`/seller-dashboard/chats`} className="pt-order-dropdown__item">
                            <MessageCircle size={14} className="pt-order-dropdown__icon" />
                            <span>View Chat</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default OrderItem 