"use client"

const Step2ValorantData = ({ formData, handleChange, errors }) => {
    const rankOptions = [
        "Unranked",
        "Iron",
        "Bronze",
        "Silver",
        "Gold",
        "Platinum",
        "Diamond",
        "Ascendent",
        "Immortal",
        "Radiant",
    ]

    const serverOptions = ["Europe", "North America", "Asia Pasific", "Brazil", "Latin America"]

    return (
        <div className="acm-step-content">
            <div className="acm-form-group">
                <label className="acm-form-label" htmlFor="server">
                    Server
                </label>
                <select
                    id="server"
                    name="server"
                    className={`acm-form-select ${errors.server ? "error" : ""}`}
                    value={formData.server}
                    onChange={handleChange}
                >
                    <option value="">Select Server</option>
                    {serverOptions.map((server) => (
                        <option key={server} value={server}>
                            {server}
                        </option>
                    ))}
                </select>
                {errors.server && <div className="acm-form-error">{errors.server}</div>}
            </div>

            <div className="acm-form-row">
                <div className="acm-form-col">
                    <div className="acm-form-group">
                        <label className="acm-form-label" htmlFor="current_rank">
                            Current Rank
                        </label>
                        <select
                            id="current_rank"
                            name="current_rank"
                            className="acm-form-select"
                            value={formData.current_rank}
                            onChange={handleChange}
                        >
                            {rankOptions.map((rank) => (
                                <option key={rank} value={rank}>
                                    {rank}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="acm-form-col">
                    <div className="acm-form-group">
                        <label className="acm-form-label" htmlFor="level">
                            Account Level
                        </label>
                        <input
                            type="number"
                            id="level"
                            name="level"
                            className="acm-form-input"
                            value={formData.level}
                            onChange={handleChange}
                            min="1"
                        />
                    </div>
                </div>
            </div>

            <div className="acm-form-row">
                <div className="acm-form-col">
                    <div className="acm-form-group">
                        <label className="acm-form-label" htmlFor="valorant_points">
                            Valorant Points
                        </label>
                        <input
                            type="number"
                            id="valorant_points"
                            name="valorant_points"
                            className="acm-form-input"
                            value={formData.valorant_points}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>
                </div>
                <div className="acm-form-col">
                    <div className="acm-form-group">
                        <label className="acm-form-label" htmlFor="radianite_points">
                            Radianite Points
                        </label>
                        <input
                            type="number"
                            id="radianite_points"
                            name="radianite_points"
                            className="acm-form-input"
                            value={formData.radianite_points}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>
                </div>
            </div>

            {/* Additional Valorant-specific fields can be added here */}
        </div>
    )
}

export default Step2ValorantData
