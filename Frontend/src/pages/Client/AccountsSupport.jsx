import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ChevronLeft } from "lucide-react"

export default function AccountsSupport() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedOption, setSelectedOption] = useState("")
  const [customMessage, setCustomMessage] = useState("")

  const supportOptions = [
    "Account Issues",
    "Payment Problems",
    "Refund Request",
    "Technical Support",
    "Other Issues"
  ]

  const handleOptionSelect = (option) => {
    setSelectedOption(option)
    if (option !== "Other Issues") {
      setCustomMessage("")
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would typically send the support request to your backend
    console.log("Support request submitted:", {
      option: selectedOption,
      customMessage,
      game: location.state?.game || "Unknown"
    })
    navigate(-1) // Go back to the previous page
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-white mb-8"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </button>

          <div className="bg-[#161b22] border border-gray-800 rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-6">How can we help you?</h1>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4 mb-6">
                {supportOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleOptionSelect(option)}
                    className={`w-full text-left px-4 py-3 rounded-md border ${selectedOption === option
                      ? "border-blue-500 bg-blue-500/10 text-blue-400"
                      : "border-gray-700 hover:border-gray-600"
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {selectedOption === "Other Issues" && (
                <div className="mb-6">
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Please describe your issue..."
                    className="w-full bg-[#0d1117] border border-gray-700 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={4}
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedOption || (selectedOption === "Other Issues" && !customMessage)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 