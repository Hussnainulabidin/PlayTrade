"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { X } from "lucide-react"

function GameForm({ game, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    image: "",
    views: 0,
    rating: 0,
    status: "active",
    isNew: false,
  })

  const [errors, setErrors] = useState({})

  // Initialize form with game data if editing
  useEffect(() => {
    if (game) {
      setFormData({
        title: game.title || "",
        image: game.image || "",
        views: game.views || 0,
        rating: game.rating || 0,
        status: game.status || "active",
        isNew: game.isNew || false,
      })
    }
  }, [game])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.image.trim()) {
      newErrors.image = "Image URL is required"
    }

    if (formData.rating && (formData.rating < 0 || formData.rating > 5)) {
      newErrors.rating = "Rating must be between 0 and 5"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      // Convert numeric fields
      const gameData = {
        ...formData,
        views: Number(formData.views),
        rating: Number(formData.rating),
      }

      onSave(gameData)
    }
  }

  return (
    <div className="game-form">
      <div className="form-header">
        <h2>{game ? "Edit Game" : "Add New Game"}</h2>
        <button className="close-btn" onClick={onCancel}>
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? "error" : ""}
          />
          {errors.title && <p className="error-text">{errors.title}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="image">Image URL</label>
          <Input
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className={errors.image ? "error" : ""}
          />
          {errors.image && <p className="error-text">{errors.image}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="views">Views</label>
          <Input id="views" name="views" type="number" min="0" value={formData.views} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label htmlFor="rating">Rating (0-5)</label>
          <Input
            id="rating"
            name="rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.rating}
            onChange={handleChange}
            className={errors.rating ? "error" : ""}
          />
          {errors.rating && <p className="error-text">{errors.rating}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={formData.status} onChange={handleChange} className="select-input">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleChange} />
            <span>Mark as New</span>
          </label>
        </div>

        <div className="form-actions">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{game ? "Update Game" : "Create Game"}</Button>
        </div>
      </form>
    </div>
  )
}

export default GameForm

