"use client"

import { useState, useEffect } from "react"
import {
    ChevronDown,
    Crown,
    Search,
    User,
    ShoppingCart,
    CreditCard,
    PlayCircle,
    CheckCircle,
    Users,
    Package,
    Gamepad2,
    Gift,
    Coins,
    Zap,
} from "lucide-react"
import { Button } from "../components/ui/landing-button"
import { Input } from "../components/ui/landing-input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/landing-accordion"
import "./landingPage.css"

function App() {
    const [activeServiceIndex, setActiveServiceIndex] = useState(0)
    const [activeStatIndex, setActiveStatIndex] = useState(0)
    const [activeProcessIndex, setActiveProcessIndex] = useState(0)
    const [activeFaqIndex, setActiveFaqIndex] = useState(0)

    useEffect(() => {
        const intervalId = setInterval(() => {
            setActiveServiceIndex((prevIndex) => (prevIndex + 1) % 7)
            setActiveStatIndex((prevIndex) => (prevIndex + 1) % 4)
            setActiveProcessIndex((prevIndex) => (prevIndex + 1) % 4)
            setActiveFaqIndex((prevIndex) => (prevIndex + 1) % 5)
        }, 2000)

        return () => clearInterval(intervalId)
    }, [])

    return (
        <div className="min-h-screen bg-[#0d1524] text-white">
            {/* Header */}
            <header className="border-b border-gray-800 py-4">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="flex items-center mr-8">
                            <Crown className="h-6 w-6 text-blue-500" />
                            <span className="ml-2 text-xl font-bold">
                                <span className="text-blue-500">PLAY</span>TRADE
                            </span>
                        </div>
                        <div className="hidden md:flex items-center bg-[#1a2234] rounded-md px-3 py-2">
                            <button className="flex items-center text-sm">
                                <Gamepad2 className="h-5 w-5 mr-2 text-gray-400" />
                                Select Game
                                <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="hidden md:flex items-center mr-4">
                            <img
                                src="https://via.placeholder.com/24"
                                width={24}
                                height={24}
                                alt="English"
                                className="rounded-full mr-2"
                            />
                            <span className="text-sm">English</span>
                            <span className="mx-2 text-gray-500">/</span>
                            <span className="text-sm">USD</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-300" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section
                className="py-16 md:py-24 bg-cover bg-center bg-no-repeat relative"
                style={{ backgroundImage: "url(https://via.placeholder.com/1600x800)" }}
            >
                <div className="absolute inset-0 bg-[#0d1524]/80"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        The <span className="text-blue-500">All-In-One</span> Platform for Gamers
                    </h1>
                    <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                        High-Quality Accounts · Premium Gaming Services · In-Game Currencies
                    </p>
                    <div className="max-w-2xl mx-auto relative mb-12">
                        <Input
                            type="text"
                            placeholder="Search for games..."
                            className="w-full h-12 pl-12 pr-4 bg-[#1a2234] border-none rounded-lg text-white"
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    {/* Service Icons */}
                    {(() => {
                        const services = [
                            { icon: Users, label: "Accounts" },
                            { icon: Zap, label: "Boosting" },
                            { icon: Package, label: "Items" },
                            { icon: Coins, label: "Currencies" },
                            { icon: CreditCard, label: "Top Ups" },
                            { icon: User, label: "Buddy" },
                            { icon: Gift, label: "Gift Cards" },
                        ]

                        return (
                            <div className="grid grid-cols-3 md:grid-cols-7 gap-4 max-w-4xl mx-auto">
                                {services.map((service, index) => (
                                    <div key={service.label} className="flex flex-col items-center">
                                        <div
                                            className={`w-12 h-12 ${index === activeServiceIndex ? "bg-blue-600" : "bg-[#1a2234]"} rounded-lg flex items-center justify-center mb-2 transition-colors duration-300`}
                                        >
                                            <service.icon
                                                className={`h-6 w-6 ${index === activeServiceIndex ? "text-white" : "text-blue-500"}`}
                                            />
                                        </div>
                                        <span className="text-sm">{service.label}</span>
                                    </div>
                                ))}
                            </div>
                        )
                    })()}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">What are you waiting for?</h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                        Step up your game now! Let our pros boost your level and guide you to the higher ranks you deserve.
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 h-auto text-lg rounded-md">
                        <Gamepad2 className="mr-2 h-5 w-5" />
                        Select Game
                    </Button>
                </div>
            </section>

            {/* Trust Section */}
            <section className="py-16 bg-[#0a101c]">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-start justify-between mb-12">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-2">
                                More Than 85,000+
                                <br />
                                Gamers Trust Us
                            </h2>
                        </div>
                        <div className="mt-4 md:mt-0 bg-[#1a2234] p-4 rounded-lg flex items-center">
                            <img src="https://via.placeholder.com/120x32" width={120} height={32} alt="Trustpilot" className="mr-4" />
                            <div>
                                <div className="font-bold">Excellent 4.8 out of 5.0</div>
                                <div className="text-sm text-gray-400">Based on 9,450 reviews</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="bg-[#1a2234] p-6 rounded-lg">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-700 mr-3"></div>
                                    <div>
                                        <div className="font-bold">Username</div>
                                        <div className="text-sm text-gray-400">Country</div>
                                    </div>
                                    <div className="ml-auto">
                                        <div className="text-green-500">★★★★★</div>
                                    </div>
                                </div>
                                <p className="text-gray-300">
                                    Was very satisfied with the account. Instant delivery to my email with recovery email and password and
                                    the email and password to the email to change password as well. Will definitely purchase again.
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between">
                        <div className="mb-8 md:mb-0">
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">
                                PlayTrade in
                                <br />
                                Numbers
                            </h2>
                        </div>
                        <div className="max-w-xl">
                            <p className="text-xl text-gray-300">
                                Our team has united the most experienced people in the gaming industry, from all over the world, with
                                one mission: "To truly change the life of every day gamers."
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    {(() => {
                        const stats = [
                            {
                                icon: Users,
                                number: "250,000+",
                                label: "Gamers we Empowered",
                                description: "Proudly serving a thriving community of passionate gamers worldwide!",
                            },
                            {
                                icon: ShoppingCart,
                                number: "320,000+",
                                label: "Orders Completed",
                                description: "Accounts, Boosting, Coaching and we're just getting started.",
                            },
                            {
                                icon: Gamepad2,
                                number: "2022",
                                label: "Operating Since",
                                description: "That's all it took us to revolutionize the game services industry.",
                            },
                            {
                                icon: Users,
                                number: "1200+",
                                label: "Partners",
                                description: "The very best partners stand ready to fulfill your orders.",
                            },
                        ]

                        return (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
                                {stats.map((stat, index) => (
                                    <div
                                        key={stat.label}
                                        className={`${index === activeStatIndex ? "bg-blue-600" : "bg-[#1a2234]"
                                            } p-6 rounded-lg transition-colors duration-300`}
                                    >
                                        <div
                                            className={`flex items-center justify-center h-12 w-12 ${index === activeStatIndex ? "bg-blue-700" : "bg-[#0d1524]"
                                                } rounded-full mb-4`}
                                        >
                                            <stat.icon className={`h-6 w-6 ${index === activeStatIndex ? "text-white" : "text-gray-400"}`} />
                                        </div>
                                        <h3 className="text-3xl md:text-4xl font-bold mb-1">{stat.number}</h3>
                                        <p className={`${index === activeStatIndex ? "text-gray-200" : "text-gray-400"} mb-4`}>
                                            {stat.label}
                                        </p>
                                        <p className={`text-sm ${index === activeStatIndex ? "text-white" : "text-gray-300"}`}>
                                            {stat.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )
                    })()}
                </div>
            </section>

            {/* Features Section */}
            <section
                className="py-16 md:py-24 bg-cover bg-center bg-no-repeat relative"
                style={{ backgroundImage: "url(https://via.placeholder.com/1600x800)" }}
            >
                <div className="absolute inset-0 bg-[#0d1524]/90"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center">Gaming Services Just Got Better</h2>
                    <p className="text-xl text-gray-300 mb-16 text-center">
                        We are setting the new standard in the gaming industry.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="relative">
                            <div className="bg-[#1a2234]/80 p-8 rounded-lg h-full">
                                <img
                                    src="https://via.placeholder.com/400x300"
                                    width={400}
                                    height={300}
                                    alt="Support"
                                    className="mb-8 rounded-lg w-full"
                                />
                                <h3 className="text-2xl font-bold mb-4">24/7 Live Support</h3>
                                <p className="text-gray-300">
                                    Our team is always available to help you with any questions or issues you might have.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-[#1a2234]/80 p-8 rounded-lg h-full">
                                <img
                                    src="https://via.placeholder.com/400x300"
                                    width={400}
                                    height={300}
                                    alt="Cashback"
                                    className="mb-8 rounded-lg w-full"
                                />
                                <h3 className="text-2xl font-bold mb-4">3-6% Cashback on all purchases</h3>
                                <p className="text-gray-300">Earn rewards with every purchase you make on our platform.</p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-[#1a2234]/80 p-8 rounded-lg h-full">
                                <img
                                    src="https://via.placeholder.com/400x300"
                                    width={400}
                                    height={300}
                                    alt="Privacy"
                                    className="mb-8 rounded-lg w-full"
                                />
                                <h3 className="text-2xl font-bold mb-4">Full Privacy & Anonymity</h3>
                                <p className="text-gray-300">Who are you? We don't know. Your privacy is our top priority.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            {(() => {
                                const processSteps = [
                                    {
                                        icon: Gamepad2,
                                        title: "Select Service",
                                    },
                                    {
                                        icon: CreditCard,
                                        title: "Secure Payment",
                                    },
                                    {
                                        icon: PlayCircle,
                                        title: "Order Starts",
                                        description: "Sit back, relax and enjoy - We will take care of everything for you",
                                    },
                                    {
                                        icon: CheckCircle,
                                        title: "Order Completed",
                                    },
                                ]

                                return (
                                    <div className="space-y-6">
                                        {processSteps.map((step, index) => (
                                            <div
                                                key={step.title}
                                                className={`${index === activeProcessIndex ? "bg-blue-600" : "bg-[#1a2234]"
                                                    } p-6 rounded-lg flex items-center transition-colors duration-300`}
                                            >
                                                <div
                                                    className={`w-10 h-10 rounded-full ${index === activeProcessIndex ? "bg-blue-700" : "bg-[#0d1524]"
                                                        } flex items-center justify-center mr-4`}
                                                >
                                                    <step.icon
                                                        className={`h-5 w-5 ${index === activeProcessIndex ? "text-white" : "text-gray-400"}`}
                                                    />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-xl">{step.title}</span>
                                                    {step.description && <p className="text-sm mt-1">{step.description}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            })()}
                        </div>
                        <div className="flex items-center justify-center">
                            <img
                                src="https://via.placeholder.com/500x400"
                                width={500}
                                height={400}
                                alt="Order Process"
                                className="rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular Games */}
            <section className="py-16 bg-[#0a101c]">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-8 text-center">Popular Games</h2>
                    <div className="flex overflow-x-auto pb-6 space-x-4 scrollbar-hide">
                        {[
                            "Fortnite",
                            "League of Legends",
                            "Valorant",
                            "GTA V",
                            "Clash of Clans",
                            "Call of Duty",
                            "Brawl Stars",
                        ].map((game) => (
                            <div key={game} className="flex-shrink-0 w-48 h-64 rounded-lg overflow-hidden">
                                <img
                                    src={`https://via.placeholder.com/192x256?text=${game}`}
                                    width={192}
                                    height={256}
                                    alt={game}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Fast and Easy */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            We Like To Keep It
                            <br />
                            Fast And Easy
                        </h2>
                        <p className="text-xl text-gray-300">
                            Buying boosting, accounts and coaching has never been this easy. Just select your service, make a payment
                            and enjoy!
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 bg-[#0a101c]">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">
                                Frequently Asked
                                <br />
                                Questions
                            </h2>
                            <p className="text-gray-300 mb-4">
                                Got anymore questions? Feel free to contact us on Discord or Live Chat!
                            </p>
                        </div>
                        <div>
                            {(() => {
                                const faqItems = [
                                    {
                                        question: "What is PlayTrade?",
                                        answer:
                                            "PlayTrade is the ultimate platform for gamers looking to buy game accounts, boost their rankings, or purchase in-game items. We provide secure transactions and guaranteed service quality.",
                                    },
                                    {
                                        question: "When was PlayTrade established?",
                                        answer:
                                            "PlayTrade was established in 2022 and has quickly grown to become a trusted platform in the gaming community.",
                                    },
                                    {
                                        question: "Why should I choose PlayTrade?",
                                        answer:
                                            "We offer competitive prices, 24/7 customer support, secure transactions, and a wide range of services for all popular games. Our team consists of professional gamers who understand your needs.",
                                    },
                                    {
                                        question: "How can I work with you?",
                                        answer:
                                            "If you're a skilled gamer looking to join our team of boosters or account providers, please visit our Partners page or contact us directly through Discord.",
                                    },
                                    {
                                        question: "How can I get help?",
                                        answer:
                                            "Our customer support team is available 24/7 through live chat on our website or through our Discord server. We're always ready to assist you with any questions or concerns.",
                                    },
                                ]

                                return (
                                    <Accordion type="single" collapsible className="space-y-4">
                                        {faqItems.map((item, index) => (
                                            <AccordionItem key={item.question} value={`item-${index + 1}`} className="border-b-0">
                                                <AccordionTrigger
                                                    className={`${index === activeFaqIndex ? "bg-blue-600" : "bg-[#1a2234]"
                                                        } p-4 rounded-lg hover:no-underline transition-colors duration-300`}
                                                >
                                                    {item.question}
                                                </AccordionTrigger>
                                                <AccordionContent className="bg-[#1a2234] p-4 rounded-b-lg mt-[-8px] pt-0 border-t border-gray-700">
                                                    {item.answer}
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                )
                            })()}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#0a101c] pt-16 pb-8 border-t border-gray-800">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                        <div>
                            <div className="flex items-center mb-4">
                                <Crown className="h-6 w-6 text-blue-500" />
                                <span className="ml-2 text-xl font-bold">
                                    <span className="text-blue-500">PLAY</span>TRADE
                                </span>
                            </div>
                            <p className="text-gray-400 mb-4">The All-In-One Platform for Gamers</p>
                            <p className="text-gray-400 text-sm mb-2">Changing the lives of everyday gamers, one game at a time.</p>
                            <div className="text-xs text-gray-500 space-y-1">
                                <p>Headquarter: 123 Gaming Street, Gaming City</p>
                                <p>Office: Gaming Tower, 4th floor, Gaming City</p>
                                <p>Registration Number: 12345678</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Company</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a href="#" className="hover:text-blue-500">
                                        Contact us
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-blue-500">
                                        Work with us
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-blue-500">
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-blue-500">
                                        Definitions
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-blue-500">
                                        Site Map
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-blue-500">
                                        Help Center
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Legal</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a href="#" className="hover:text-blue-500">
                                        Terms of service
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-blue-500">
                                        Privacy policy
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-blue-500">
                                        Cookies policy
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-blue-500">
                                        Code of honor
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Need Help?</h3>
                            <p className="text-gray-400 mb-4">
                                We're here to help. Our expert human-support team is at your service 24/7.
                            </p>
                            <div className="flex space-x-4 mb-6">
                                <Button className="bg-[#1a2234] hover:bg-[#232d42] text-white">Let's Chat</Button>
                                <Button className="bg-[#5865F2] hover:bg-[#4752c4] text-white">Join Discord</Button>
                            </div>
                            <div className="flex items-center">
                                <img
                                    src="https://via.placeholder.com/24"
                                    width={24}
                                    height={24}
                                    alt="English"
                                    className="rounded-full mr-2"
                                />
                                <span className="text-sm">English</span>
                                <span className="mx-2 text-gray-500">/</span>
                                <span className="text-sm">USD</span>
                                <button className="ml-4 text-gray-400">
                                    <span className="sr-only">Toggle dark mode</span>🌙
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default App

