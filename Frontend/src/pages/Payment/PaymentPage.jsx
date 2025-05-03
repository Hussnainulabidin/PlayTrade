"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ArrowLeft, CreditCard, Lock } from "lucide-react"
import { useUser } from "../../components/userContext/UserContext"
import { orderApi } from "../../api"
import { gameAccountApi } from "../../api"
import stripeApi from "../../api/stripeApi"
import config from "../../config"
import { getStripe, formatAmountForDisplay } from "../../utils/stripe"
import { 
  CardElement,
  Elements,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import "./PaymentPage.css"

// Card element options
const cardElementOptions = {
  style: {
    base: {
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

// Checkout form component that uses Stripe Elements
function CheckoutForm({ clientSecret, paymentIntentId, accountId, gameType, total, isAuthenticated, user }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  
  const [cardName, setCardName] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!cardName) {
      alert("Please enter the cardholder name");
      return;
    }
    
    // Element & Stripe check
    if (!stripe || !elements) {
      setError("Stripe has not initialized yet. Please try again.");
      return;
    }
    
    // Authentication check - enable for production
    if (!isAuthenticated) {
      console.warn("User is not authenticated. Proceeding anyway for testing purposes.");
      // In production, uncomment the following:
      // alert("You must be logged in to complete the purchase");
      // return;
    }
    
    try {
      setProcessingPayment(true);
      console.log("Processing payment with intent ID:", paymentIntentId);
      
      // Determine if we're using mock payment or real Stripe
      const useMockPayment = clientSecret === "mock_client_secret";
      let paymentSuccessful = false;
      
      if (!useMockPayment && stripe) {
        // PRODUCTION MODE: Use real Stripe payment flow with Elements
        try {
          console.log("Using real Stripe payment with clientSecret:", clientSecret?.slice(0, 10) + "...");
          
          const cardElement = elements.getElement(CardElement);
          
          // Use confirmCardPayment with CardElement
          const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: cardElement,
              billing_details: { 
                name: cardName,
                email: user?.email || ''
              }
            }
          });
          
          if (result.error) {
            console.error("Payment confirmation error:", result.error);
            throw new Error(result.error.message || "Payment failed");
          }
          
          console.log("Payment result:", result);
          if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
            console.log("Payment confirmed successfully with intent:", result.paymentIntent.id);
            paymentSuccessful = true;
          } else {
            console.error("Payment not successful:", result);
            paymentSuccessful = false;
            throw new Error("Payment failed with unknown status");
          }
        } catch (stripeError) {
          console.error("Stripe error:", stripeError);
          throw new Error("Payment processing failed: " + stripeError.message);
        }
      } else {
        // DEVELOPMENT MODE: Use mock payment flow
        console.log("Using mock payment processing");
        paymentSuccessful = true;
      }
      
      if (paymentSuccessful) {
        // Simulate processing delay for better UX
        setTimeout(async () => {
          try {
            console.log("Creating order for account:", accountId);
            
            // Create order with paid status
            const orderResponse = await orderApi.createOrder({
              accountID: accountId,
              gameType: gameType,
              status: "paid", // Setting paid status directly
              paymentIntentId: paymentIntentId // Include this for record-keeping
            });
            
            console.log("Order creation response:", orderResponse);
            
            if (orderResponse.data && orderResponse.data.status === "success") {
              const orderId = orderResponse.data.data._id;
              console.log("Order created successfully:", orderId);
              
              // Navigate to the order details page
              navigate(`/order/${orderId}`);
            } else {
              throw new Error("Order creation failed: " + JSON.stringify(orderResponse));
            }
          } catch (err) {
            console.error("Order creation error:", err);
            setError(err.message || "Order creation failed. Please contact support.");
            setProcessingPayment(false);
          }
        }, 1500); // Reduced to 1.5 seconds for better UX
      } else {
        throw new Error("Payment was not successful. Please try again.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Payment processing failed. Please try again.");
      setProcessingPayment(false);
    }
  }
  
  return (
    <form onSubmit={handlePayment}>
      <div className="mb-6">
        <label className="block text-gray-400 text-sm mb-2">Cardholder Name</label>
        <input
          type="text"
          className="w-full bg-[#211f2d] border border-[#2d2b3a] rounded-lg p-3 text-white"
          placeholder="John Doe"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          required
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-400 text-sm mb-2">Card Details</label>
        <div className="w-full bg-[#211f2d] border border-[#2d2b3a] rounded-lg p-3 text-white">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="text-red-500 mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center text-sm text-gray-400 mb-6">
        <Lock className="w-4 h-4 mr-2" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      <button
        type="submit"
        className={`w-full ${processingPayment ? 'bg-[#4c1d95] cursor-not-allowed' : 'bg-[#7c3aed] hover:bg-[#6d28d9]'} py-3 rounded-md font-semibold flex items-center justify-center`}
        disabled={processingPayment || !stripe}
      >
        {processingPayment ? (
          <>
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            Processing Payment...
          </>
        ) : (
          <>Pay ${total.toFixed(2)}</>
        )}
      </button>
    </form>
  );
}

// Main payment page component
export default function PaymentPage() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const accountId = searchParams.get('accountId')
  const gameType = searchParams.get('gameType') || 'Valorant'
  
  const navigate = useNavigate()
  const { user, isAuthenticated } = useUser()
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Price calculations
  const [subtotal, setSubtotal] = useState(0)
  const [processingFee, setProcessingFee] = useState(0)
  const [total, setTotal] = useState(0)
  
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [stripePromise, setStripePromise] = useState(null);

  // Initialize Stripe
  useEffect(() => {
    setStripePromise(getStripe());
  }, []);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      if (!accountId) {
        setError("No account specified")
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        
        // Fetch account details based on game type
        let accountResponse
        
        switch (gameType.toLowerCase()) {
          case 'valorant':
            accountResponse = await gameAccountApi.getValorantAccount(accountId)
            break
          case 'fortnite':
            accountResponse = await gameAccountApi.getFortniteAccount(accountId)
            break
          case 'leagueoflegends':
            accountResponse = await gameAccountApi.getLeagueAccount(accountId)
            break
          case 'clashofclans':
            accountResponse = await gameAccountApi.getClashOfClansAccount(accountId)
            break
          case 'brawlstars':
            accountResponse = await gameAccountApi.getBrawlStarsAccount(accountId)
            break
          default:
            accountResponse = await gameAccountApi.getValorantAccount(accountId)
        }
        
        if (accountResponse.data.status === "success") {
          const accountData = accountResponse.data.data?.account || accountResponse.data.data
          setAccount(accountData)
          
          // Calculate pricing
          const price = accountData.price || 0
          const fee = parseFloat((price * 0.05).toFixed(2)) // 5% processing fee
          
          setSubtotal(price)
          setProcessingFee(fee)
          setTotal(price + fee)
        } else {
          setError("Account not found")
        }
      } catch (err) {
        setError(err.message || "Failed to fetch account details")
        console.error("Error fetching account details:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAccountDetails()
  }, [accountId, gameType])

  // Verify configurations
  useEffect(() => {
    // Verify the required configurations are set properly
    if (config.STRIPE_PUBLISHABLE_KEY === undefined || config.STRIPE_PUBLISHABLE_KEY === '') {
      console.warn("Stripe publishable key is not set. Using mock payment flow instead.");
    } else {
      console.log("Stripe publishable key is configured.");
    }

    // Check if user is authenticated
    if (!isAuthenticated && account) {
      console.warn("User is not authenticated. Payment might fail at order creation.");
    }
  }, [isAuthenticated, account]);

  // Create payment intent when account data is loaded
  useEffect(() => {
    // Only create a payment intent if we have the account and total price
    if (account && total > 0) {
      const createIntent = async () => {
        try {
          console.log("Creating payment intent with:", { accountId, gameType });
          
          // DEVELOPMENT MODE: Use mock payment intent for testing
          const useMockPayment = false; // Set to false when API is fully working
          
          if (!useMockPayment) {
            // PRODUCTION MODE: Use real Stripe API
            try {
              console.log("Attempting to create real payment intent via API");
              const response = await stripeApi.createPaymentIntent({
                accountId: accountId,
                gameType: gameType
              });
              
              console.log("Payment intent API response:", response);
              
              if (response?.data?.status === 'success' && response.data.data?.clientSecret) {
                setClientSecret(response.data.data.clientSecret);
                setPaymentIntentId(response.data.data.paymentIntentId);
                console.log("Payment intent created successfully with secret:", response.data.data.clientSecret.slice(0, 10) + "...");
              } else {
                console.error("Payment intent creation failed:", response?.data || "No data received");
                throw new Error(response?.data?.message || "Failed to create payment intent");
              }
            } catch (apiError) {
              console.error("API error creating payment intent:", apiError);
              setError(`Payment setup failed: ${apiError.message || "Unknown error"}`);
              // Don't fallback to mock - just show the error
              throw apiError;
            }
          } else {
            // DEVELOPMENT MODE: Use mock payment intent for testing
            console.log("Using mock payment intent for testing");
            setClientSecret("mock_client_secret");
            setPaymentIntentId("mock_payment_intent_id");
          }
        } catch (err) {
          console.error("Error in payment setup:", err);
          setError("Payment setup failed. Please try again or contact support.");
        }
      };

      createIntent();
    }
  }, [account, total]);

  return (
    <div className="payment-page min-h-screen bg-[#0f0d1d] text-white">
      {/* Header */}
      <header className="border-b border-[#2d2b3a] bg-[#1a172b]">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="text-[#7c3aed] w-5 h-5">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3A5.25 5.25 0 0 0 12 1.5Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="pt-logo-text">
              <span className="text-[#7c3aed]">PLAY</span>TRADE
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7c3aed]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-red-500 mb-2">Error loading payment details</div>
            <div className="text-gray-400">{error}</div>
          </div>
        ) : account ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Payment Form */}
            <div className="lg:col-span-2">
              <div className="bg-[#1a172b] border border-[#2d2b3a] rounded-lg overflow-hidden">
                <div className="p-4 border-b border-[#2d2b3a]">
                  <h1 className="text-2xl font-bold">Complete Your Payment</h1>
                </div>
                
                <div className="p-5">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Pay with</h2>
                    <div className="bg-[#211f2d] rounded-lg p-4 mb-4 flex items-center">
                      <div className="w-6 h-6 rounded-full border-2 border-[#7c3aed] mr-3 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-[#7c3aed]"></div>
                      </div>
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 mr-2 text-[#7c3aed]" />
                        <span>Debit/Credit Card (Stripe)</span>
                      </div>
                    </div>
                  </div>

                  {clientSecret && stripePromise && (
                    <Elements stripe={stripePromise}>
                      <CheckoutForm 
                        clientSecret={clientSecret}
                        paymentIntentId={paymentIntentId}
                        accountId={accountId}
                        gameType={gameType}
                        total={total}
                        isAuthenticated={isAuthenticated}
                        user={user}
                      />
                    </Elements>
                  )}
                </div>
              </div>
            </div>

            {/* Right column - Order Summary */}
            <div>
              <div className="bg-[#1a172b] border border-[#2d2b3a] rounded-lg overflow-hidden sticky top-4">
                <div className="p-5 border-b border-[#2d2b3a]">
                  <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
                  
                  {account && (
                    <div className="flex items-start gap-3 mb-4 pb-4 border-b border-[#2d2b3a]">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-[#211f2d] flex-shrink-0">
                        {account.gallery && account.gallery[0] ? (
                          <img 
                            src={account.gallery[0]} 
                            alt={account.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#211f2d]">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-500">
                              <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {account.title || `${gameType} Account (${account.server || "N/A"})`}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          {account.server || "N/A"} - {account.account_data?.current_rank || "Unranked"}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Processing Fee</span>
                      <span>+${processingFee.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between font-semibold pt-3 border-t border-[#2d2b3a]">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 bg-[#211f2d]">
                  <div className="text-sm text-gray-400 mb-3">
                    By completing this purchase you agree to our <a href="#" className="text-[#7c3aed]">Terms of Service</a>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <Lock className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span>256-bit SSL Encrypted payment. You're safe.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400">Account not found</div>
          </div>
        )}
      </main>
    </div>
  )
} 