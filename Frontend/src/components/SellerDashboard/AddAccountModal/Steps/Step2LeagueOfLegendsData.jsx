"use client"

const Step2LeagueOfLegendsData = ({ formData, handleChange, errors }) => {
    const rankOptions = [
        "Unranked",
        "Iron",
        "Bronze",
        "Silver",
        "Gold",
        "Platinum",
        "Diamond",
        "Master",
        "Grandmaster",
        "Challenger"
    ]

    const divisionOptions = ["IV", "III", "II", "I"]

    const serverOptions = [
        "NA",
        "EUW",
        "EUNE",
        "BR",
        "LAN",
        "LAS",
        "OCE",
        "RU",
        "TR",
        "JP",
        "KR"
    ]

    return (
        <div className="step-content">
            <div className="form-group">
                <label className="form-label" htmlFor="server">
                    Server
                </label>
                <select
                    id="server"
                    name="server"
                    className={`form-select ${errors.server ? "error" : ""}`}
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
                {errors.server && <div className="form-error">{errors.server}</div>}
            </div>

            <div className="form-row">
                <div className="form-col">
                    <div className="form-group">
                        <label className="form-label" htmlFor="rank">
                            Rank
                        </label>
                        <select
                            id="rank"
                            name="rank"
                            className="form-select"
                            value={formData.rank}
                            onChange={handleChange}
                        >
                            <option value="">Select Rank</option>
                            {rankOptions.map((rank) => (
                                <option key={rank} value={rank}>
                                    {rank}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="form-col">
                    <div className="form-group">
                        <label className="form-label" htmlFor="division">
                            Division
                        </label>
                        <select
                            id="division"
                            name="division"
                            className="form-select"
                            value={formData.division}
                            onChange={handleChange}
                            disabled={formData.rank === "Unranked" || formData.rank === "Master" || formData.rank === "Grandmaster" || formData.rank === "Challenger"}
                        >
                            <option value="">Select Division</option>
                            {divisionOptions.map((division) => (
                                <option key={division} value={division}>
                                    {division}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="form-row">
                <div className="form-col">
                    <div className="form-group">
                        <label className="form-label" htmlFor="level">
                            Account Level
                        </label>
                        <input
                            type="number"
                            id="level"
                            name="level"
                            className="form-input"
                            value={formData.level}
                            onChange={handleChange}
                            min="1"
                        />
                    </div>
                </div>
                <div className="form-col">
                    <div className="form-group">
                        <label className="form-label" htmlFor="blue_essence">
                            Blue Essence
                        </label>
                        <input
                            type="number"
                            id="blue_essence"
                            name="blue_essence"
                            className="form-input"
                            value={formData.blue_essence}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>
                </div>
            </div>

            <div className="form-row">
                <div className="form-col">
                    <div className="form-group">
                        <label className="form-label" htmlFor="rp">
                            RP
                        </label>
                        <input
                            type="number"
                            id="rp"
                            name="rp"
                            className="form-input"
                            value={formData.rp}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>
                </div>
                <div className="form-col">
                    <div className="form-group">
                        <label className="form-label" htmlFor="champions">
                            Champions Owned
                        </label>
                        <input
                            type="number"
                            id="champions"
                            name="champions"
                            className="form-input"
                            value={formData.champions}
                            onChange={handleChange}
                            min="0"
                            max="160"
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
        </div>
    )
}

export default Step2LeagueOfLegendsData 