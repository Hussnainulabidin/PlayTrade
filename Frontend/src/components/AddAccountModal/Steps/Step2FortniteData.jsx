"use client"

const Step2FortniteData = ({ formData, handleChange, errors }) => {
    const platforms = ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"]
    const regions = ["NA-East", "NA-West", "Europe", "Asia", "Oceania", "Brazil", "Middle East"]

    return (
        <div className="step-content">
            <div className="form-group">
                <label className="form-label" htmlFor="platform">
                    Platform
                </label>
                <select
                    id="platform"
                    name="platform"
                    className={`form-select ${errors.platform ? "error" : ""}`}
                    value={formData.platform}
                    onChange={handleChange}
                >
                    <option value="">Select Platform</option>
                    {platforms.map((platform) => (
                        <option key={platform} value={platform}>
                            {platform}
                        </option>
                    ))}
                </select>
                {errors.platform && <div className="form-error">{errors.platform}</div>}
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="region">
                    Region
                </label>
                <select
                    id="region"
                    name="region"
                    className={`form-select ${errors.region ? "error" : ""}`}
                    value={formData.region}
                    onChange={handleChange}
                >
                    <option value="">Select Region</option>
                    {regions.map((region) => (
                        <option key={region} value={region}>
                            {region}
                        </option>
                    ))}
                </select>
                {errors.region && <div className="form-error">{errors.region}</div>}
            </div>

            <div className="form-row">
                <div className="form-col">
                    <div className="form-group">
                        <label className="form-label" htmlFor="account_level">
                            Account Level
                        </label>
                        <input
                            type="number"
                            id="account_level"
                            name="account_level"
                            className="form-input"
                            value={formData.account_level}
                            onChange={handleChange}
                            min="1"
                        />
                    </div>
                </div>
                <div className="form-col">
                    <div className="form-group">
                        <label className="form-label" htmlFor="vbucks">
                            V-Bucks
                        </label>
                        <input
                            type="number"
                            id="vbucks"
                            name="vbucks"
                            className="form-input"
                            value={formData.vbucks}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="skins">
                    Number of Skins
                </label>
                <input
                    type="number"
                    id="skins"
                    name="skins"
                    className="form-input"
                    value={formData.skins}
                    onChange={handleChange}
                    min="0"
                />
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="battle_pass">
                    Battle Pass
                </label>
                <select
                    id="battle_pass"
                    name="battle_pass"
                    className="form-select"
                    value={formData.battle_pass}
                    onChange={handleChange}
                >
                    <option value="">Select Battle Pass Status</option>
                    <option value="none">No Battle Pass</option>
                    <option value="current">Current Season</option>
                    <option value="previous">Previous Seasons</option>
                </select>
            </div>
        </div>
    )
}

export default Step2FortniteData 