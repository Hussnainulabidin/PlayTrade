"use client"

const Step2ClashOfClansData = ({ formData, handleChange, errors }) => {
    const townHallLevels = Array.from({ length: 16 }, (_, i) => i + 1)
    const builderHallLevels = Array.from({ length: 10 }, (_, i) => i + 1)

    return (
        <div className="acm-step-content">
            <div className="acm-form-row">
                <div className="acm-form-col">
                    <div className="acm-form-group">
                        <label className="acm-form-label" htmlFor="town_hall_level">
                            Town Hall Level
                        </label>
                        <select
                            id="town_hall_level"
                            name="town_hall_level"
                            className={`acm-form-select ${errors.town_hall_level ? "error" : ""}`}
                            value={formData.town_hall_level}
                            onChange={handleChange}
                        >
                            <option value="">Select Town Hall Level</option>
                            {townHallLevels.map((level) => (
                                <option key={level} value={level}>
                                    TH {level}
                                </option>
                            ))}
                        </select>
                        {errors.town_hall_level && <div className="acm-form-error">{errors.town_hall_level}</div>}
                    </div>
                </div>
                <div className="acm-form-col">
                    <div className="acm-form-group">
                        <label className="acm-form-label" htmlFor="builder_hall_level">
                            Builder Hall Level
                        </label>
                        <select
                            id="builder_hall_level"
                            name="builder_hall_level"
                            className="acm-form-select"
                            value={formData.builder_hall_level}
                            onChange={handleChange}
                        >
                            <option value="">Select Builder Hall Level</option>
                            {builderHallLevels.map((level) => (
                                <option key={level} value={level}>
                                    BH {level}
                                </option>
                            ))}
                        </select>
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
                        <label className="acm-form-label" htmlFor="trophies">
                            Trophies
                        </label>
                        <input
                            type="number"
                            id="trophies"
                            name="trophies"
                            className="acm-form-input"
                            value={formData.trophies}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>
                </div>
            </div>

            <div className="acm-form-group">
                <label className="acm-form-label" htmlFor="clan">
                    Clan
                    <span className="acm-optional-label">(Optional)</span>
                </label>
                <input
                    type="text"
                    id="clan"
                    name="clan"
                    className="acm-form-input"
                    value={formData.clan}
                    onChange={handleChange}
                    placeholder="Clan name"
                />
            </div>
        </div>
    )
}

export default Step2ClashOfClansData 