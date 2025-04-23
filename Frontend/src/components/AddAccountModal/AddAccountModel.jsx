"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { X, Zap, Truck, Plus } from 'lucide-react'
import "./AddAccountModal.css"
import Step1ListingInfo from "./Steps/Step1ListingInfo"
import Step2ValorantData from "./Steps/Step2ValorantData"
import Step3Credentials from "./Steps/Step3Credentials"

const AddAccountModal = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState({
        // Step 1: Listing Info
        title: "",
        slug: "",
        price: "",
        game: "Valorant",
        description: "",
        gallery: [],

        // Step 2: Game Data (Valorant)
        server: "",
        current_rank: "Unranked",
        level: 1,
        valorant_points: 0,
        radianite_points: 0,

        // Step 3: Credentials
        login: "",
        password: "",
        email_login: "",
        email_password: "",
        in_game_name: "",
        has_2fa: false,
        delivery_instructions: "",
        delivery_type: "instant" // instant or manual
    })
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)

    // Close modal on escape key
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === "Escape") {
                onClose()
            }
        }
        window.addEventListener("keydown", handleEsc)
        return () => {
            window.removeEventListener("keydown", handleEsc)
        }
    }, [onClose])

    // Prevent body scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "auto"
        }
        return () => {
            document.body.style.overflow = "auto"
        }
    }, [isOpen])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: type === "checkbox" ? checked : value
            }

            // Only update slug when title changes
            if (name === "title") {
                const slug = value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
                newData.slug = slug
            }

            return newData
        })

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            })
        }
    }

    const handleSlugChange = (title) => {
        // Convert title to slug format (lowercase, replace spaces with hyphens)
        const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
        setFormData({
            ...formData,
            slug
        })
    }

    const validateStep = (step) => {
        const newErrors = {}

        if (step === 1) {
            if (!formData.title.trim()) newErrors.title = "Title is required"
            if (!formData.price) newErrors.price = "Price is required"
        }
        else if (step === 2) {
            if (!formData.server) newErrors.server = "Server is required"
        }
        else if (step === 3) {
            if (!formData.login.trim()) newErrors.login = "Login is required"
            if (!formData.password.trim()) newErrors.password = "Password is required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        setCurrentStep(currentStep - 1)
    }

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) {
            return
        }

        setIsSubmitting(true)
        setSubmitError(null)

        try {
            // Format data according to the schema
            const accountData = {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                login: formData.login,
                password: formData.password,
                email_login: formData.email_login,
                email_password: formData.email_password,
                ign: formData.in_game_name,
                server: formData.server,
                delivery_instructions: formData.delivery_instructions,
                gallery: formData.gallery,
                account_data: {
                    current_rank: formData.current_rank,
                    level: parseInt(formData.level),
                    valorant_points: parseInt(formData.valorant_points),
                    radianite_points: parseInt(formData.radianite_points)
                }
            }

            console.log(accountData.gallery);

            const response = await axios.post("http://localhost:3003/valorant/", accountData)
            console.log(response)

            // Close modal and reset form on success
            onClose()
            setFormData({
                title: "",
                slug: "",
                price: "",
                game: "Valorant",
                description: "",
                gallery: [],
                server: "",
                current_rank: "Unranked",
                level: 1,
                valorant_points: 0,
                radianite_points: 0,
                login: "",
                password: "",
                email_login: "",
                email_password: "",
                in_game_name: "",
                has_2fa: false,
                delivery_instructions: "",
                delivery_type: "instant"
            })
            setCurrentStep(1)

        } catch (error) {
            console.error("Error creating account:", error)
            setSubmitError(error.response?.data?.message || "Failed to create account. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Add new Account</h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-steps">
                    <div className={`step ${currentStep === 1 ? "active" : currentStep > 1 ? "completed" : ""}`}>
                        <div className="step-number">1</div>
                        <div className="step-label">Listing Info</div>
                    </div>
                    <div className={`step ${currentStep === 2 ? "active" : currentStep > 2 ? "completed" : ""}`}>
                        <div className="step-number">2</div>
                        <div className="step-label">Game Data</div>
                    </div>
                    <div className={`step ${currentStep === 3 ? "active" : ""}`}>
                        <div className="step-number">3</div>
                        <div className="step-label">Credentials</div>
                    </div>
                </div>

                <div className="modal-content">
                    {currentStep === 1 && (
                        <Step1ListingInfo
                            formData={formData}
                            handleChange={handleChange}
                            errors={errors}
                        />
                    )}

                    {currentStep === 2 && (
                        <Step2ValorantData
                            formData={formData}
                            handleChange={handleChange}
                            errors={errors}
                        />
                    )}

                    {currentStep === 3 && (
                        <Step3Credentials
                            formData={formData}
                            handleChange={handleChange}
                            errors={errors}
                        />
                    )}

                    {submitError && (
                        <div className="error-message">{submitError}</div>
                    )}
                </div>

                <div className="modal-footer">
                    {currentStep > 1 ? (
                        <button className="btn btn-secondary" onClick={prevStep} disabled={isSubmitting}>
                            ← Previous
                        </button>
                    ) : (
                        <button className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </button>
                    )}

                    {currentStep < 3 ? (
                        <button className="btn btn-primary" onClick={nextStep}>
                            Continue →
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : "Add Account"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AddAccountModal
