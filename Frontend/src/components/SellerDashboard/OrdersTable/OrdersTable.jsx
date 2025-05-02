import OrderItem from "../OrderItem/OrderItem"
import "./SellerOrdersTable.css"

const OrdersTable = ({ orders }) => {
    return (
        <div className="pt-orders-table">
            <div className="pt-orders-table__header">
                <div className="pt-order-cell--checkbox">
                    <input type="checkbox" />
                </div>
                <div className="pt-order-cell--title">TITLE</div>
                <div className="pt-order-cell--order-id">ORDER ID</div>
                <div className="pt-order-cell--buyer">BUYER</div>
                <div className="pt-order-cell--status">STATUS</div>
                <div className="pt-order-cell--price">PRICE</div>
                <div className="pt-order-cell--date">ORDER DATE</div>
                <div className="pt-order-cell--actions"></div>
            </div>

            <div className="pt-orders-table__body">
                {orders.length > 0 ? (
                    orders.map((order) => <OrderItem key={order._id} order={order} />)
                ) : (
                    <div className="pt-orders-table__empty">No orders found</div>
                )}
            </div>
        </div>
    )
}

export default OrdersTable 