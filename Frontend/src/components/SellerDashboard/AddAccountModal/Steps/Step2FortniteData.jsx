"use client"

const Step2FortniteData = ({ formData, handleChange, errors }) => {
    const platformOptions = ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"]
    const regionOptions = ["Europe", "NA East", "NA West", "Brazil", "Asia", "Oceania", "Middle East"]
    const battlePassOptions = ["None", "Current Season", "Multiple Seasons"]

    return (
        <div className="acm-step-content">
            <div className="acm-form-row">
                <div className="acm-form-col">
                    <div className="acm-form-group">
                        <label className="acm-form-label" htmlFor="platform">
                            Platform
                        </label>
                        <select
                            id="platform"
                            name="platform"
                            className={`acm-form-select ${errors.platform ? "error" : ""}`}
                            value={formData.platform}
                            onChange={handleChange}
                        >
                            <option value="">Select Platform</option>
                            {platformOptions.map((platform) => (
                                <option key={platform} value={platform}>
                                    {platform}
                                </option>
                            ))}
                        </select>
                        {errors.platform && <div className="acm-form-error">{errors.platform}</div>}
                    </div>
                </div>
                <div className="acm-form-col">
                    <div className="acm-form-group">
                        <label className="acm-form-label" htmlFor="region">
                            Region
                        </label>
                        <select
                            id="region"
                            name="region"
                            className={`acm-form-select ${errors.region ? "error" : ""}`}
                            value={formData.region}
                            onChange={handleChange}
                        >
                            <option value="">Select Region</option>
                            {regionOptions.map((region) => (
                                <option key={region} value={region}>
                                    {region}
                                </option>
                            ))}
                        </select>
                        {errors.region && <div className="acm-form-error">{errors.region}</div>}
                    </div>
                </div>
            </div>

            <div className="acm-form-row">
                <div className="acm-form-col">
                    <div className="acm-form-group">
                        <label className="acm-form-label" htmlFor="account_level">
                            Account Level
                        </label>
                        <input
                            type="number"
                            id="account_level"
                            name="account_level"
                            className="acm-form-input"
                            value={formData.account_level}
                            onChange={handleChange}
                            min="1"
                        />
                    </div>
                </div>
                <div className="acm-form-col">
                    <div className="acm-form-group">
                        <label className="acm-form-label" htmlFor="vbucks">
                            V-Bucks
                        </label>
                        <input
                            type="number"
                            id="vbucks"
                            name="vbucks"
                            className="acm-form-input"
                            value={formData.vbucks}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>
                </div>
            </div>

            <div className="acm-form-row">
                <div className="acm-form-col">
                    <div className="acm-form-group">
                        <label className="acm-form-label" htmlFor="skins">
                            Number of Skins
                        </label>
                        <input
                            type="number"
                            id="skins"
                            name="skins"
                            className="acm-form-input"
                            value={formData.skins}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>
                </div>
                <div className="acm-form-col">
                    <div className="acm-form-group">
                        <label className="acm-form-label" htmlFor="battle_pass">
                            Battle Pass
                        </label>
                        <select
                            id="battle_pass"
                            name="battle_pass"
                            className="acm-form-select"
                            value={formData.battle_pass}
                            onChange={handleChange}
                        >
                            <option value="">Select Battle Pass Status</option>
                            {battlePassOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            {/* Additional Fortnite-specific fields can be added here */}
        </div>
    )
}

export default Step2FortniteData 