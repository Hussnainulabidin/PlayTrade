import React from 'react';
import { ArrowLeft, ChevronRight, Paperclip, SmilePlus, MessageCircle } from 'lucide-react';
import './OrderDetails.css';

function OrderDetails() {
  return (
    <div className="order-container">
      <div className="order-wrapper">
        <div className="order-main">
          {/* Header */}
          <div className="order-header">
            <ArrowLeft className="back-icon" />
            <span className="back-text">All Orders</span>
          </div>

          {/* Order Card */}
          <div className="order-card">
            <div className="order-summary">
              <img 
                src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=50&h=50" 
                alt="Game Icon" 
                className="game-icon"
              />
              <div className="summary-details">
                <div className="item-tags">
                  <span>🌍 EU</span>
                  <span>⚔️ Xenohunter Knife</span>
                  <span>🎮 Gaia&apos;s Vengeance Vandal</span>
                  <span>🛡️ Recon Guardian</span>
                </div>
                <div className="order-id">
                  Order ID: 2aecb1a0-635f-41ec-94a2-befadc8c6099
                </div>
              </div>
              <span className="status-badge">
                Delivered
              </span>
            </div>

            {/* Order Details Box */}
            <div className="details-box">
              <div className="status-header">
                <div className="status-icon">
                  <ChevronRight className="chevron-icon" />
                </div>
                <div>
                  <h2 className="status-title">Order delivered</h2>
                  <p className="status-date">Apr 12, 2025, 1:58:09 AM</p>
                </div>
              </div>

              {/* Account Details Card */}
              <div className="account-details">
                <h3 className="account-title">Account details:</h3>
                <div className="account-info">
                  <p>Account Username: SAGAMERS30008</p>
                  <p>Account Password: ********</p>
                  <p>Email Website: https://mail.zsthost.com/</p>
                  <p>Email Login: vanibujuname@210406981.xyz</p>
                  <p>Email Password: ********</p>
                </div>
              </div>

              <button className="cancel-btn">
                Cancel order
              </button>
            </div>
          </div>

          {/* Chat Section */}
          <div className="chat-section">
            <div className="user-info">
              <div className="user-avatar">
                C
              </div>
              <div className="user-details">
                <p className="user-name">CalmKensai691</p>
                <p className="user-type">Order for Accounts</p>
              </div>
              <MessageCircle className="message-icon" />
            </div>

            <div className="chat-messages">
              <div className="message">
                <p className="message-text">Order Created: https://www.eldorado.gg/order/2aecb1a0-635f-41ec-94a2-befadc8c6099</p>
              </div>
              <div className="message">
                <p className="message-text">Order Delivered. If you received goods or services, please mark this Order as &quot;Received&quot; and leave feedback.</p>
              </div>
            </div>

            <div className="chat-input">
              <input
                type="text"
                placeholder="Say something..."
                className="input-field"
              />
              <Paperclip className="input-icon" />
              <SmilePlus className="input-icon" />
            </div>
          </div>
        </div>

        {/* Right Side Details */}
        <div className="order-sidebar">
          {/* Guaranteed Delivery Time */}
          <div className="sidebar-card">
            <h3 className="card-title">Guaranteed delivery time</h3>
            <div className="delivery-info">
              <span className="delivery-icon">⚡</span>
              <span>Instant delivery</span>
            </div>
          </div>

          {/* Order Details */}
          <div className="sidebar-card">
            <h3 className="card-title">Order details</h3>
            <div className="detail-rows">
              <div className="detail-row">
                <span className="detail-label">Game</span>
                <span>Valorant</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Rank</span>
                <span>Diamond</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Agents</span>
                <span>6-10 Agents</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Weapon Skins</span>
                <span>1-9 Skins</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Region</span>
                <span>EU/TR/MENA/CIS</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Device</span>
                <span>💻 PC</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Buyer</span>
                <span>CalmKensai691</span>
              </div>
            </div>
            <button className="view-description">
              View full description
            </button>
          </div>

          {/* Payment Details */}
          <div className="sidebar-card">
            <h3 className="card-title">Payment details</h3>
            <div className="detail-rows">
              <div className="detail-row">
                <span className="detail-label">Order Price</span>
                <span>$84.00</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Commission</span>
                <span className="commission-amount">-$12.60</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">You receive</span>
                <span>$71.40</span>
              </div>
            </div>
            <p className="info-text">
              Funds will be added to your Eldorado balance 5 days after the order is marked as received by the buyer.
            </p>
            <p className="info-text margin-top">
              If the buyer does not confirm delivery within 3 days, it will be confirmed automatically.
            </p>
            <div className="help-box">
              <p className="help-text">
                Learn more in our FAQ.
                <br />
                Chat with Eldorado Support, we&apos;re available 24/7.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;