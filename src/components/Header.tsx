import { useState, useEffect } from 'react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show header when scrolling down, hide when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const handleNavigation = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className={`header ${!isVisible ? 'hidden' : ''}`}>
      <nav className="nav">
        <button
          className="hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
        </button>

        <div className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <button
            className={`nav-link ${currentPage === 'mobile' ? 'active' : ''}`}
            onClick={() => handleNavigation('mobile')}
          >
            Mobile Photography
          </button>
          <button
            className={`nav-link ${currentPage === 'dslr' ? 'active' : ''}`}
            onClick={() => handleNavigation('dslr')}
          >
            DSLR Photography
          </button>
        </div>
      </nav>
    </header>
  );
}
