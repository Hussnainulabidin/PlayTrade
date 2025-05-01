"use client"

import { Zap, Truck } from "lucide-react"

const Step3Credentials = ({ formData, handleChange, errors }) => {
    return (
        <div className="step-content">
            <div className="form-group">
                <label className="form-label">Delivery Type</label>
                <div className="delivery-options">
                    <div
                        className={`delivery-option ${formData.delivery_type === "instant" ? "active" : ""}`}
                        onClick={() => handleChange({ target: { name: "delivery_type", value: "instant" } })}
                    >
                        <div className="delivery-option-header">
                            <div className="delivery-option-icon">
                                <Zap size={16} color={formData.delivery_type === "instant" ? "#fff" : "#8b949e"} />
                            </div>
                            <div className="delivery-option-title">Instant Delivery</div>
                        </div>
                    </div>

                    <div
                        className={`delivery-option ${formData.delivery_type === "manual" ? "active" : ""}`}
                        onClick={() => handleChange({ target: { name: "delivery_type", value: "manual" } })}
                    >
                        <div className="delivery-option-header">
                            <div className="delivery-option-icon">
                                <Truck size={16} color={formData.delivery_type === "manual" ? "#fff" : "#8b949e"} />
                            </div>
                            <div className="delivery-option-title">Manual Delivery</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-row">
                <div className="form-col">
                    <div className="form-group">
                        <label className="form-label" htmlFor="login">
                            Login
                        </label>
                        <input
                            type="text"
                            id="login"
                            name="login"
                            className={`form-input ${errors.login ? "error" : ""}`}
                            value={formData.login}
                            onChange={handleChange}
                            placeholder="katarina"
                        />
                        {errors.login && <div className="form-error">{errors.login}</div>}
                    </div>
                </div>
                <div className="form-col">
                    <div className="form-group">
                        <label className="form-label" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className={`form-input ${errors.password ? "error" : ""}`}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                        />
                        {errors.password && <div className="form-error">{errors.password}</div>}
                    </div>
                </div>
            </div>

            <div className="form-row">
                <div className="form-col">
                    <div className="form-group">
                        <label className="form-label" htmlFor="email_login">
                            Email Login
                        </label>
                        <input
                            type="email"
                            id="email_login"
                            name="email_login"
                            className="form-input"
                            value={formData.email_login}
                            onChange={handleChange}
                            placeholder="jxxy@mail.com"
                        />
                    </div>
                </div>
                <div className="form-col">
                    <div className="form-group">
                        <label className="form-label" htmlFor="email_password">
                            Email Password
                        </label>
                        <input
                            type="password"
                            id="email_password"
                            name="email_password"
                            className="form-input"
                            value={formData.email_password}
                            onChange={handleChange}
                            placeholder="••••••••"
                        />
                    </div>
                </div>
            </div>

            <div className="form-row">
                <div className="form-col">
                    <div className="form-group">
                        <label className="form-label" htmlFor="in_game_name">
                            In-Game Name
                            <span className="optional-label">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            id="in_game_name"
                            name="in_game_name"
                            className="form-input"
                            value={formData.in_game_name}
                            onChange={handleChange}
                            placeholder="Katarina"
                        />
                    </div>
                </div>
                <div className="form-col">
                    <div className="form-group" style={{ display: "flex", alignItems: "center", height: "100%" }}>
                        <label className="form-label" style={{ marginBottom: 0, marginRight: "16px" }}>
                            Has 2FA
                        </label>
                        <label className="toggle-switch">
                            <input type="checkbox" name="has_2fa" checked={formData.has_2fa} onChange={handleChange} />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="delivery_instructions">
                    Delivery Instructions
                    <span className="optional-label">(Optional)</span>
                </label>
                <textarea
                    id="delivery_instructions"
                    name="delivery_instructions"
                    className="form-textarea"
                    value={formData.delivery_instructions}
                    onChange={handleChange}
                    placeholder="Extra information for the buyer, they will see this after purchase."
                ></textarea>
            </div>
        </div>
    )
}

export default Step3Credentials
