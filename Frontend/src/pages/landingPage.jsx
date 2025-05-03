import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Zap,
  Package,
  Coins,
  CreditCard,
  User,
  Gift,
  Gamepad2,
  ShoppingCart,
  Search,
  Crown,
  ChevronDown,
  PlayCircle,
  CheckCircle,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { LoginModal } from "../components/LoginModal/LoginModal";
import { SignupModal } from "../components/SignupModal/SignupModal";
import { UserMenu } from "../components/UserMenu/UserMenu";
import "./landingPage.css";
import { useUser } from "../components/userContext/UserContext";
import { Link } from 'react-router-dom';

function PlayTradeLanding() {
  const { user, isAuthenticated, login, logout } = useUser();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [activeStatIndex, setActiveStatIndex] = useState(0);
  const [activeProcessIndex, setActiveProcessIndex] = useState(0);
  const [activeFaqIndex, setActiveFaqIndex] = useState(0);
  const [openFaqItem, setOpenFaqItem] = useState(null);
  const gamesSliderRef = useRef(null);
  const [isSliderPaused, setIsSliderPaused] = useState(false);
  const autoScrollIntervalRef = useRef(null);
  const [activeGameIndex, setActiveGameIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const allGames = [
    { name: "Fortnite", image: "/images/Fort.png", path: "/accounts/fortnite" },
    { name: "League of Legends", image: "/images/Log.png", path: "/accounts/leagueoflegends" },
    { name: "Valorant", image: "/images/Val.jpg", path: "/accounts/valorant" },
    { name: "Clash of Clans", image: "/images/Coc.png", path: "/accounts/clashofclans" },
    { name: "Brawl Stars", image: "/images/Bs.jpg", path: "/accounts/brawlstars" },
  ];

  const games = [
    { name: "Fortnite", image: "/images/Fort.png", path: "/accounts/fortnite" },
    { name: "League of Legends", image: "/images/Log.png", path: "/accounts/leagueoflegends" },
    { name: "Valorant", image: "/images/Val.jpg", path: "/accounts/valorant" },
  ];

  const filteredGames = allGames.filter(game =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveServiceIndex((prevIndex) => (prevIndex + 1) % 7);
      setActiveStatIndex((prevIndex) => (prevIndex + 1) % 3);
      setActiveProcessIndex((prevIndex) => (prevIndex + 1) % 4);
      setActiveFaqIndex((prevIndex) => (prevIndex + 1) % 5);
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  // Auto-scroll games slider
  useEffect(() => {
    const startAutoScroll = () => {
      if (autoScrollIntervalRef.current) return;

      // Only start auto-scroll if slider is visible (mobile view)
      if (window.innerWidth < 992) {
        autoScrollIntervalRef.current = setInterval(() => {
          if (!isSliderPaused && gamesSliderRef.current) {
            const slider = gamesSliderRef.current;
            const maxScroll = slider.scrollWidth - slider.clientWidth;

            if (slider.scrollLeft >= maxScroll) {
              // Reset to beginning when reaching the end
              slider.scrollTo({
                left: 0,
                behavior: 'smooth'
              });
              setActiveGameIndex(0);
            } else {
              // Scroll by one card width (approximately)
              slider.scrollTo({
                left: slider.scrollLeft + 200,
                behavior: 'smooth'
              });
              setActiveGameIndex(prevIndex => (prevIndex + 1) % 3);
            }
          }
        }, 3000); // Scroll every 3 seconds
      }
    };

    startAutoScroll();

    // Clean up function
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [isSliderPaused]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add scroll listener for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setHeaderScrolled(true);
      } else {
        setHeaderScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Add resize listener for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      // Clear auto-scroll interval on larger screens
      if (window.innerWidth >= 992 && autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      } else if (window.innerWidth < 992 && !autoScrollIntervalRef.current && !isSliderPaused) {
        // Restart auto-scroll on smaller screens
        const slider = gamesSliderRef.current;
        if (slider) {
          autoScrollIntervalRef.current = setInterval(() => {
            if (!isSliderPaused) {
              const maxScroll = slider.scrollWidth - slider.clientWidth;
              if (slider.scrollLeft >= maxScroll) {
                slider.scrollTo({
                  left: 0,
                  behavior: 'smooth'
                });
                setActiveGameIndex(0);
              } else {
                slider.scrollTo({
                  left: slider.scrollLeft + 200,
                  behavior: 'smooth'
                });
                setActiveGameIndex(prevIndex => (prevIndex + 1) % 3);
              }
            }
          }, 3000);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isSliderPaused]);

  const toggleFaqItem = (index) => {
    setOpenFaqItem(openFaqItem === index ? null : index);
  };

  const handleLoginSuccess = async (userData) => {
    await login(userData); // This will set user in context and store token/userId in localStorage
  };

  const handleLogout = () => {
    logout(); // This will clear context and localStorage
    setIsSidebarOpen(false);
  };

  const switchToSignup = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
  };

  const switchToLogin = () => {
    setIsSignupModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const renderUserMenu = () => {
    if (isAuthenticated && user) {
      return (
        <div className="relative">
          <div
            // className="pt-user-icon cursor-pointer"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {user.username ? (
              <div className="user-initial pt-user-icon cursor-pointer">
                {user.username.charAt(0).toUpperCase()}
              </div>
            ) : (
              <User className="pt-icon" />
            )}
          </div>
          <UserMenu
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            userData={{
              username: user.username,
              role: user.role,
              email: user.email,
              balance: user.balance || 0,
              id: user._id,
            }}
            handleLogout={handleLogout}
          />
        </div>
      );
    }

    return (
      <button
        className="pt-login-button"
        onClick={() => setIsLoginModalOpen(true)}
      >
        Login
      </button>
    );
  };

  const scrollGamesSlider = (direction) => {
    if (gamesSliderRef.current) {
      const slider = gamesSliderRef.current;
      const cardWidth = 200; // Approximate width of a card including gap
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      const currentScroll = slider.scrollLeft;
      const totalGames = 3; // Total number of games in the slider

      let newScroll;
      let newIndex;

      if (direction === 'left') {
        if (currentScroll <= 0) {
          // If at the start, scroll to the end
          newScroll = maxScroll;
          newIndex = totalGames - 1;
        } else {
          // Scroll left by one card
          newScroll = Math.max(0, currentScroll - cardWidth);
          newIndex = Math.max(0, activeGameIndex - 1);
        }
      } else if (direction === 'right') {
        if (currentScroll >= maxScroll) {
          // If at the end, scroll to the start
          newScroll = 0;
          newIndex = 0;
        } else {
          // Scroll right by one card
          newScroll = Math.min(maxScroll, currentScroll + cardWidth);
          newIndex = Math.min(totalGames - 1, activeGameIndex + 1);
        }
      } else {
        // If direction is a number (index), use it directly
        newIndex = direction;
        newScroll = newIndex * cardWidth;
      }

      slider.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });

      setActiveGameIndex(newIndex);
    }
  };

  const handleSliderMouseEnter = () => {
    setIsSliderPaused(true);
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
  };

  const handleSliderMouseLeave = () => {
    setIsSliderPaused(false);
    // Restart auto-scroll when mouse leaves
    if (!autoScrollIntervalRef.current) {
      autoScrollIntervalRef.current = setInterval(() => {
        if (!isSliderPaused && gamesSliderRef.current) {
          const slider = gamesSliderRef.current;
          const maxScroll = slider.scrollWidth - slider.clientWidth;
          const totalGames = 3;

          if (slider.scrollLeft >= maxScroll) {
            // Reset to beginning when reaching the end
            slider.scrollTo({
              left: 0,
              behavior: 'smooth'
            });
            setActiveGameIndex(0);
          } else {
            // Scroll by one card width
            slider.scrollTo({
              left: slider.scrollLeft + 200,
              behavior: 'smooth'
            });
            setActiveGameIndex(prevIndex => (prevIndex + 1) % totalGames);
          }
        }
      }, 3000);
    }
  };

  return (
    <div className="playtrade-landing">
      <header className={`pt-header ${headerScrolled ? 'pt-header-scrolled' : ''}`}>
        <div className="pt-container">
          <div className="pt-logo">
            <Crown className="pt-crown-icon" />
            <span className="pt-logo-text">
              <span className="pt-purple">PLAY</span>TRADE
            </span>
          </div>
          {renderUserMenu()}
        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        switchToSignup={switchToSignup}
        onLoginSuccess={handleLoginSuccess}
      />

      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        switchToLogin={switchToLogin}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Hero Section */}
      <section className="pt-hero">
        <div className="pt-container pt-text-center">
          <h1 className="pt-hero-title">
            The <span className="pt-purple">All-In-One</span> Platform for Gamers
          </h1>
          <p className="pt-hero-subtitle">
            High-Quality Accounts · Premium Gaming Services · In-Game Currencies
          </p>

          <div className="pt-search-container" ref={searchRef}>
            <div className="pt-search-input">
              <Search className="pt-search-icon" />
              <input
                type="text"
                placeholder="Search for games..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
              />
            </div>
            {isSearchOpen && (
              <div className="pt-search-dropdown">
                {filteredGames.length > 0 ? (
                  filteredGames.map((game) => (
                    <Link
                      key={game.name}
                      to={game.path}
                      className="pt-search-dropdown-item"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                    >
                      <img
                        src={game.image}
                        alt={game.name}
                        className="pt-search-game-image"
                      />
                      <span>{game.name}</span>
                    </Link>
                  ))
                ) : (
                  <div className="pt-search-dropdown-item">
                    No games found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Service Icons */}
          <div className="pt-services-grid">
            {[
              { icon: Users, label: "Accounts" },
              { icon: Zap, label: "Boosting" },
              { icon: Package, label: "Items" },
              { icon: Coins, label: "Currencies" },
              { icon: CreditCard, label: "Top Ups" },
              { icon: User, label: "Buddy" },
              { icon: Gift, label: "Gift Cards" },
            ].map((service, index) => (
              <div key={service.label} className="pt-service-item">
                <div
                  className={`pt-service-icon ${index === activeServiceIndex ? "pt-active" : ""
                    }`}
                >
                  <service.icon className="pt-icon" />
                </div>
                <span className="pt-service-label">{service.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Games */}
      <section className="pt-games">
        <div className="pt-container">
          <h2 className="pt-section-title pt-text-center">Popular Games</h2>
          <p className="pt-section-subtitle pt-text-center">Featured selections from our most popular games</p>
          
          {/* Show centered games without slider on larger screens */}
          <div className="pt-games-grid">
            {games.map((game) => (
              <Link to={game.path} key={game.name} className="pt-game-card">
                <img
                  src={game.image}
                  alt={game.name}
                  className="pt-game-image"
                />
                <div className="pt-game-name">{game.name}</div>
              </Link>
            ))}
          </div>
          
          {/* Slider for smaller screens - hidden on larger screens */}
          <div
            className="pt-games-slider-container pt-mobile-only"
            onMouseEnter={handleSliderMouseEnter}
            onMouseLeave={handleSliderMouseLeave}
          >
            <button
              className="pt-slider-button pt-slider-button-left"
              onClick={() => scrollGamesSlider('left')}
              aria-label="Previous games"
            >
              <ChevronLeft className="pt-slider-icon" />
            </button>

            <div className="pt-games-slider" ref={gamesSliderRef}>
              {[
                { name: "Fortnite", image: "/images/Fort.png", path: "/accounts/fortnite" },
                { name: "League of Legends", image: "/images/Log.png", path: "/accounts/leagueoflegends" },
                { name: "Valorant", image: "/images/Val.jpg", path: "/accounts/valorant" },
              ].map((game) => (
                game.path ? (
                  <Link to={game.path} key={game.name} className="pt-game-card">
                    <img
                      src={game.image}
                      alt={game.name}
                      className="pt-game-image"
                    />
                    <div className="pt-game-name">{game.name}</div>
                  </Link>
                ) : (
                  <div key={game.name} className="pt-game-card">
                    <img
                      src={game.image}
                      alt={game.name}
                      className="pt-game-image"
                    />
                    <div className="pt-game-name">{game.name}</div>
                  </div>
                )
              ))}
            </div>

            <button
              className="pt-slider-button pt-slider-button-right"
              onClick={() => scrollGamesSlider('right')}
              aria-label="Next games"
            >
              <ChevronRight className="pt-slider-icon" />
            </button>

            <div className="pt-slider-indicators">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  className={`pt-slider-indicator ${index === activeGameIndex ? 'pt-active' : ''}`}
                  onClick={() => scrollGamesSlider(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="pt-trust">
        <div className="pt-container">
          <div className="pt-trust-header">
            <div>
              <h2 className="pt-section-title">
                More Than 85,000+
                <br />
                Gamers Trust Us
              </h2>
            </div>
            <div className="pt-trustpilot">
              <img
                src="https://via.placeholder.com/120x32?text=Trustpilot"
                alt="Trustpilot"
                className="pt-trustpilot-logo"
              />
              <div>
                <div className="pt-trustpilot-rating">
                  Excellent 4.8 out of 5.0
                </div>
                <div className="pt-trustpilot-reviews">
                  Based on 9,450 reviews
                </div>
              </div>
            </div>
          </div>

          <div className="pt-reviews-grid">
            {[1, 2, 3].map((item) => (
              <div key={item} className="pt-review-card">
                <div className="pt-review-header">
                  <div className="pt-avatar"></div>
                  <div>
                    <div className="pt-username">Username</div>
                    <div className="pt-country">Country</div>
                  </div>
                  <div className="pt-stars">★★★★★</div>
                </div>
                <p className="pt-review-text">
                  Was very satisfied with the account. Instant delivery to my
                  email with recovery email and password and the email and
                  password to the email to change password as well. Will
                  definitely purchase again.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="pt-stats">
        <div className="pt-container">
          <div className="pt-stats-header">
            <div>
              <h2 className="pt-section-title">
                PlayTrade in
                <br />
                Numbers
              </h2>
            </div>
            <div className="pt-stats-description">
              <p>
                Our team has united the most experienced people in the gaming
                industry, from all over the world, with one mission: "To truly
                change the life of every day gamers."
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="pt-stats-grid">
            {[
              {
                icon: Users,
                number: "250,000+",
                label: "Gamers we Empowered",
                description:
                  "Proudly serving a thriving community of passionate gamers worldwide!",
              },
              {
                icon: ShoppingCart,
                number: "320,000+",
                label: "Orders Completed",
                description:
                  "Accounts, Boosting, Coaching and we're just getting started.",
              },
              {
                icon: Gamepad2,
                number: "2022",
                label: "Operating Since",
                description:
                  "That's all it took us to revolutionize the game services industry.",
              },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={`pt-stat-card ${index === activeStatIndex ? "pt-active" : ""
                  }`}
              >
                <div className="pt-stat-icon">
                  <stat.icon className="pt-icon" />
                </div>
                <h3 className="pt-stat-number">{stat.number}</h3>
                <p className="pt-stat-label">{stat.label}</p>
                <p className="pt-stat-description">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="pt-features">
        <div className="pt-container pt-text-center">
          <h2 className="pt-section-title">Gaming Services Just Got Better</h2>
          <p className="pt-section-subtitle">
            We are setting the new standard in the gaming industry.
          </p>

          <div className="pt-features-grid">
            <div className="pt-feature-card">
              <img
                src="https://via.placeholder.com/400x300"
                alt="Support"
                className="pt-feature-image"
              />
              <h3 className="pt-feature-title">24/7 Live Support</h3>
              <p className="pt-feature-description">
                Our team is always available to help you with any questions or
                issues you might have.
              </p>
            </div>
            <div className="pt-feature-card">
              <img
                src="https://via.placeholder.com/400x300"
                alt="Cashback"
                className="pt-feature-image"
              />
              <h3 className="pt-feature-title">
                3-6% Cashback on all purchases
              </h3>
              <p className="pt-feature-description">
                Earn rewards with every purchase you make on our platform.
              </p>
            </div>
            <div className="pt-feature-card">
              <img
                src="https://via.placeholder.com/400x300"
                alt="Privacy"
                className="pt-feature-image"
              />
              <h3 className="pt-feature-title">Full Privacy & Anonymity</h3>
              <p className="pt-feature-description">
                Who are you? We don't know. Your privacy is our top priority.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="pt-process">
        <div className="pt-container">
          <div className="pt-process-grid">
            <div className="pt-process-steps">
              {[
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
                  description:
                    "Sit back, relax and enjoy - We will take care of everything for you",
                },
                {
                  icon: CheckCircle,
                  title: "Order Completed",
                },
              ].map((step, index) => (
                <div
                  key={step.title}
                  className={`pt-process-step ${index === activeProcessIndex ? "pt-active" : ""
                    }`}
                >
                  <div className="pt-process-icon">
                    <step.icon className="pt-icon" />
                  </div>
                  <div>
                    <div className="pt-process-title">{step.title}</div>
                    {step.description && (
                      <div className="pt-process-description">
                        {step.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-process-image">
              <img
                src="https://via.placeholder.com/500x400"
                alt="Order Process"
                className="pt-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Fast and Easy */}
      <section className="pt-fast-easy">
        <div className="pt-container">
          <div className="pt-fast-easy-content">
            <h2 className="pt-section-title">
              We Like To Keep It
              <br />
              Fast And Easy
            </h2>
            <p className="pt-fast-easy-text">
              Buying boosting, accounts and coaching has never been this easy.
              Just select your service, make a payment and enjoy!
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pt-faq">
        <div className="pt-container">
          <div className="pt-faq-grid">
            <div className="pt-faq-header">
              <h2 className="pt-section-title">
                Frequently Asked
                <br />
                Questions
              </h2>
              <p className="pt-faq-subtitle">
                Got anymore questions? Feel free to contact us on Discord or
                Live Chat!
              </p>
            </div>
            <div className="pt-faq-items">
              {[
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
              ].map((item, index) => (
                <div
                  key={index}
                  className={`pt-faq-item ${index === activeFaqIndex ? "pt-active" : ""
                    }`}
                >
                  <div
                    className="pt-faq-question"
                    onClick={() => toggleFaqItem(index)}
                  >
                    {item.question}
                    {openFaqItem === index ? (
                      <ChevronUp className="pt-faq-icon" />
                    ) : (
                      <ChevronDown className="pt-faq-icon" />
                    )}
                  </div>
                  <div
                    className={`pt-faq-answer ${openFaqItem === index ? "pt-open" : ""
                      }`}
                  >
                    {item.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-footer">
        <div className="pt-container">
          <div className="pt-footer-grid">
            <div className="pt-footer-company">
              <div className="pt-footer-logo">
                <Crown className="pt-crown-icon" />
                <span className="pt-logo-text">
                  <span className="pt-purple">PLAY</span>TRADE
                </span>
              </div>
              <p className="pt-footer-tagline">
                The All-In-One Platform for Gamers
              </p>
              <p className="pt-footer-mission">
                Changing the lives of everyday gamers, one game at a time.
              </p>
              <div className="pt-footer-info">
                <p>FAST University, 3 A.K. Brohi Road, H-11/4</p>
                <p>H 11/4 H-11, Islamabad</p>
                <p>Registration Number: 12345678</p>
              </div>
            </div>
            <div className="pt-footer-links">
              <h3 className="pt-footer-heading">Company</h3>
              <ul className="pt-footer-list">
                <li>
                  <a href="#">Contact us</a>
                </li>
                <li>
                  <a href="#">Work with us</a>
                </li>
                <li>
                  <a href="#">Blog</a>
                </li>
                <li>
                  <a href="#">Definitions</a>
                </li>
                <li>
                  <a href="#">Site Map</a>
                </li>
                <li>
                  <a href="#">Help Center</a>
                </li>
              </ul>
            </div>
            <div className="pt-footer-links">
              <h3 className="pt-footer-heading">Legal</h3>
              <ul className="pt-footer-list">
                <li>
                  <a href="#">Terms of service</a>
                </li>
                <li>
                  <a href="#">Privacy policy</a>
                </li>
                <li>
                  <a href="#">Cookies policy</a>
                </li>
                <li>
                  <a href="#">Code of honor</a>
                </li>
              </ul>
            </div>
            <div className="pt-footer-help">
              <h3 className="pt-footer-heading">Need Help?</h3>
              <p className="pt-footer-help-text">
                We're here to help. Our expert human-support team is at your
                service 24/7.
              </p>
              <div className="pt-footer-buttons">
                <button className="pt-footer-button pt-chat">Let's Chat</button>
                <button className="pt-footer-button pt-discord">
                  Join Discord
                </button>
              </div>
              <div className="pt-footer-language">
                <img
                  src="https://via.placeholder.com/24"
                  alt="English"
                  className="pt-language-flag"
                />
                <span>English</span>
                <span className="pt-divider">/</span>
                <span>USD</span>
                <button className="pt-theme-toggle">🌙</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PlayTradeLanding;
