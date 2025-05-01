"use client"

const Step2BrawlStarsData = ({ formData, handleChange, errors }) => {
    const trophyRanges = [
        "0-500",
        "501-1000",
        "1001-2000",
        "2001-3000",
        "3001-4000",
        "4001-5000",
        "5001+"
    ]

    return (
        <div className="acm-step-content">
            <div className="acm-form-row">
                <div className="acm-form-col">
                    <div className="acm-form-group">
                        <label className="acm-form-label" htmlFor="trophy_range">
                            Trophy Range
                        </label>
                        <select
                            id="trophy_range"
                            name="trophy_range"
                            className={`acm-form-input ${errors.trophy_range ? "error" : ""}`}
                            value={formData.trophy_range}
                            onChange={handleChange}
                        >
                            <option value="">Select Trophy Range</option>
                            {trophyRanges.map((range) => (
                                <option key={range} value={range}>
                                    {range}
                                </option>
                            ))}
                        </select>
                        {errors.trophy_range && <div className="acm-form-error">{errors.trophy_range}</div>}
                    </div>
                </div>
                <div className="acm-form-col">
                    <div className="acm-form-group">
                        <label className="acm-form-label" htmlFor="brawlers_unlocked">
                            Brawlers Unlocked
                        </label>
                        <input
                            type="number"
                            id="brawlers_unlocked"
                            name="brawlers_unlocked"
                            className="acm-form-input"
                            value={formData.brawlers_unlocked}
                            onChange={handleChange}
                            min="0"
                            max="70"
                        />
                    </div>
                </div>
            </div>

            <div className="acm-form-row">
                <div className="acm-form-col">
                    <div className="acm-form-group">
                        <label className="acm-form-label" htmlFor="gems">
                            Gems
                        </label>
                        <input
                            type="number"
                            id="gems"
                            name="gems"
                            className="acm-form-input"
                            value={formData.gems}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>
                </div>
                <div className="acm-form-col">
                    <div className="acm-form-group">
                        <label className="acm-form-label" htmlFor="club">
                            Club
                            <span className="optional-label">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            id="club"
                            name="club"
                            className="acm-form-input"
                            value={formData.club}
                            onChange={handleChange}
                            placeholder="Club name"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Step2BrawlStarsData 