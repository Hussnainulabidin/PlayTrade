"use client"

import { Plus, X } from "lucide-react"
import { useState } from "react"
import "./Step1ListingInfo.css"

const Step1ListingInfo = ({ formData, handleChange, handleSlugChange, errors }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [fileError, setFileError] = useState("");

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            const isValid = file.type.match(/^image\/(jpeg|png|webp|gif)$/);
            return isValid;
        });

        if (validFiles.length + selectedFiles.length > 3) {
            setFileError("You can only upload up to 3 images");
            return;
        }

        if (files.length !== validFiles.length) {
            setFileError("Only PNG, JPEG, WEBP, and GIF files are allowed");
            return;
        }

        setFileError("");
        setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 3));

        // Update the formData with the new files
        handleChange({
            target: {
                name: 'gallery',
                value: [...selectedFiles, ...validFiles].slice(0, 3)
            }
        });
    };

    const removeFile = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        setFileError("");

        // Update the formData when removing files
        handleChange({
            target: {
                name: 'gallery',
                value: newFiles
            }
        });
    };

    return (
        <div className="step-content">
            <div className="form-group">
                <label className="form-label" htmlFor="title">Account Title</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    className={`form-input ${errors.title ? 'error' : ''}`}
                    value={formData.title}
                    onChange={(e) => {
                        handleChange(e)
                    }}
                    placeholder="EUW - Platinum I"
                />
                {errors.title && <div className="form-error">{errors.title}</div>}
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="slug">
                    Slug (URL)
                    <span className="form-hint"> - This will be used in the URL</span>
                </label>
                <input
                    type="text"
                    id="slug"
                    name="slug"
                    className="form-input"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="euw-platinum-i"
                />
            </div>

            <div className="form-row">
                <div className="form-col">
                    <div className="form-group">
                        <label className="form-label" htmlFor="price">Price</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                className={`form-input ${errors.price ? 'error' : ''}`}
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0"
                                style={{ paddingLeft: '30px' }}
                            />
                            <div style={{ position: 'absolute', left: '12px', top: '10px', color: '#8b949e' }}>€</div>
                        </div>
                        {errors.price && <div className="form-error">{errors.price}</div>}
                        {formData.price && <div className="form-hint">You will get €{(formData.price * 0.9).toFixed(2)}</div>}
                    </div>
                </div>
                <div className="form-col">
                    <div className="form-group">
                        <label className="form-label" htmlFor="gameType">Game</label>
                        <select
                            id="gameType"
                            name="gameType"
                            className={`form-select ${errors.gameType ? 'error' : ''}`}
                            value={formData.gameType}
                            onChange={handleChange}
                        >
                            <option value="">Select a game</option>
                            <option value="Valorant">Valorant</option>
                            <option value="Clash of Clans">Clash of Clans</option>
                            <option value="PUBG Mobile">PUBG Mobile</option>
                            <option value="League of Legends">League of Legends</option>
                            <option value="Genshin Impact">Genshin Impact</option>
                            <option value="Mobile Legends">Mobile Legends</option>
                            <option value="Call of Duty Mobile">Call of Duty Mobile</option>
                            <option value="Fortnite">Fortnite</option>
                        </select>
                        {errors.gameType && <div className="form-error">{errors.gameType}</div>}
                    </div>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    className="form-textarea"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Mention the details of the account here."
                ></textarea>
            </div>

            <div className="form-group">
                <label className="form-label">
                    Account Gallery
                    <span className="form-hint">- Maximum 3 images</span>
                </label>
                <input
                    type="file"
                    id="gallery"
                    name="gallery"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
                <div
                    className="file-upload"
                    onClick={() => document.getElementById('gallery').click()}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="file-upload-icon">
                        <Plus size={20} color="#8b949e" />
                    </div>
                    <div className="file-upload-text">
                        Select or drag files | PNG, JPEG, WEBP, GIF
                    </div>
                </div>
                {fileError && <div className="form-error">{fileError}</div>}

                {selectedFiles.length > 0 && (
                    <div className="selected-files">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="selected-file">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Preview ${index + 1}`}
                                    className="file-preview"
                                />
                                <button
                                    type="button"
                                    className="remove-file"
                                    onClick={() => removeFile(index)}
                                    title="Remove image"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Step1ListingInfo
