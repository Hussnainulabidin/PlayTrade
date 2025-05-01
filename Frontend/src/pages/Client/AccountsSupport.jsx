import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ChevronLeft, TicketIcon, HelpCircle, AlertCircle, Phone, Mail, MessageSquare, Clock } from "lucide-react"
import { useUser } from "../../components/userContext/UserContext"
import { ticketApi, chatApi } from "../../api"
import "../pages.css"
import "./ClientTicketsPage.css"
import "./AccountsSupport.css"

export default function AccountsSupport() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useUser()
  const [selectedOption, setSelectedOption] = useState("")
  const [customMessage, setCustomMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [showFaq, setShowFaq] = useState({})

  const supportOptions = [
    { id: "account-issues", label: "Account Issues", icon: <AlertCircle size={18} /> },
    { id: "payment-problems", label: "Payment Problems", icon: <AlertCircle size={18} /> },
    { id: "refund-request", label: "Refund Request", icon: <AlertCircle size={18} /> },
    { id: "technical-support", label: "Technical Support", icon: <AlertCircle size={18} /> },
    { id: "other-issues", label: "Other Issues", icon: <HelpCircle size={18} /> }
  ]

  const faqs = [
    {
      question: "How long does it take to get a response?",
      answer: "Our support team typically responds within 24 hours. For urgent matters, you may receive a response sooner."
    },
    {
      question: "Can I update my ticket after submission?",
      answer: "Yes, you can add additional information to your ticket by viewing it in the tickets section and adding a new message."
    },
    {
      question: "What information should I include in my support request?",
      answer: "Please include as much detail as possible, including any error messages, account information, and steps to reproduce the issue if applicable."
    },
    {
      question: "How do I check the status of my ticket?",
      answer: "You can view all your tickets and their statuses in the Support Tickets section of your dashboard."
    }
  ]

  const toggleFaq = (index) => {
    setShowFaq(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const handleOptionSelect = (option) => {
    setSelectedOption(option)
    if (option !== "other-issues") {
      setCustomMessage("")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // 1. Create a ticket first using ticketApi
      const ticketResponse = await ticketApi.createTicket({
        ticketType: 'Client Ticket',
      })

      // Get the newly created ticket and chat IDs
      const { ticket, chat } = ticketResponse.data.data
      
      // 2. Send initial message to the chat using chatApi
      const selectedOptionObj = supportOptions.find(opt => opt.id === selectedOption);
      const optionLabel = selectedOptionObj ? selectedOptionObj.label : selectedOption;
      
      const initialMessage = selectedOption === "other-issues" 
        ? customMessage 
        : `Support Request: ${optionLabel}}`
      
      await chatApi.sendMessage(chat._id, {
        content: initialMessage,
      })
      
      // 3. Send system message about ticket creation
      await chatApi.sendMessage(chat._id, {
        content: `(System)Client ticket #${ticket._id.slice(-6)} created by ${user.username} (ID: ${user._id})`,
        isSystemMessage: true
      })

      // Navigate to the client tickets page
      navigate('/client/tickets', {
        state: { 
          success: true,
          message: 'Your support request has been submitted. We will respond as soon as possible.'
        }
      })
    } catch (err) {
      console.error("Error submitting support request:", err)
      setError("Failed to submit your request. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="support-page-container">
      <div className="support-page-header">
        <button
          onClick={() => navigate(-1)}
          className="back-button"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>
        <h1 className="support-page-title">Get Support</h1>
        <p className="support-page-subtitle">
          We're here to help with any issues you may encounter with your account or purchases
        </p>
      </div>

      <div className="support-page-content">
        <div className="support-form-container">
          <div className="support-form-header">
            <TicketIcon size={24} className="support-form-icon" />
            <h2 className="support-form-title">Create a Support Ticket</h2>
          </div>

          {error && (
            <div className="support-error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="support-form">
            <div className="support-form-options">
              <label className="support-form-label">What can we help you with?</label>
              <div className="support-options-grid">
                {supportOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleOptionSelect(option.id)}
                    className={`support-option-button ${selectedOption === option.id ? "support-option-selected" : ""}`}
                  >
                    <span className="support-option-icon">{option.icon}</span>
                    <span className="support-option-label">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedOption === "other-issues" && (
              <div className="support-form-message">
                <label className="support-form-label">Please describe your issue</label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Provide as much detail as possible..."
                  className="support-textarea"
                  rows={5}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedOption || (selectedOption === "other-issues" && !customMessage) || isSubmitting}
              className="support-submit-button"
            >
              {isSubmitting ? (
                <>
                  <div className="support-spinner"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <TicketIcon size={18} />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="support-sidebar">
          <div className="support-contact-info">
            <h3 className="support-sidebar-title">Contact Us</h3>
            <div className="support-contact-methods">
              <div className="support-contact-method">
                <Mail size={18} className="support-contact-icon" />
                <div className="support-contact-details">
                  <span className="support-contact-label">Email</span>
                  <span className="support-contact-value">support@playtrade.com</span>
                </div>
              </div>
              <div className="support-contact-method">
                <Phone size={18} className="support-contact-icon" />
                <div className="support-contact-details">
                  <span className="support-contact-label">Phone</span>
                  <span className="support-contact-value">+1 (555) 123-4567</span>
                </div>
              </div>
              <div className="support-contact-method">
                <MessageSquare size={18} className="support-contact-icon" />
                <div className="support-contact-details">
                  <span className="support-contact-label">Live Chat</span>
                  <span className="support-contact-value">Available 9am-6pm EST</span>
                </div>
              </div>
              <div className="support-contact-method">
                <Clock size={18} className="support-contact-icon" />
                <div className="support-contact-details">
                  <span className="support-contact-label">Support Hours</span>
                  <span className="support-contact-value">Mon-Fri: 9am-6pm EST</span>
                </div>
              </div>
            </div>
          </div>

          <div className="support-faq-section">
            <h3 className="support-sidebar-title">Frequently Asked Questions</h3>
            <div className="support-faq-list">
              {faqs.map((faq, index) => (
                <div key={index} className="support-faq-item">
                  <button 
                    className="support-faq-question" 
                    onClick={() => toggleFaq(index)}
                  >
                    <span>{faq.question}</span>
                    <HelpCircle size={16} className="support-faq-icon" />
                  </button>
                  {showFaq[index] && (
                    <div className="support-faq-answer">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 