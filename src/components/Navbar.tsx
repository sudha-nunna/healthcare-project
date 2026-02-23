import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Search, Heart, Menu, X } from "lucide-react"

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id?: string; name?: string; email?: string } | null>(null)
  const location = useLocation()
  const navigate = useNavigate()

  // Load user from localStorage and keep it in sync
  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null
    if (raw) {
      try {
        setCurrentUser(JSON.parse(raw))
      } catch {}
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === "user") {
        try {
          setCurrentUser(e.newValue ? JSON.parse(e.newValue) : null)
        } catch {
          setCurrentUser(null)
        }
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setCurrentUser(null)
    navigate("/")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
    setIsMobileMenuOpen(false)
  }

  const navLink = (path: string, label: string) => {
    const isActive = location.pathname === path;
    return (
      <Link
        key={path}
        to={path}
        className={`text-sm font-medium whitespace-nowrap px-3 py-1.5 rounded-full transition-all duration-200 ${isActive ? "bg-primary text-white shadow-md shadow-primary/30" : "text-slate-600 hover:bg-primary/10 hover:text-primary"}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="fixed top-0 w-full bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 backdrop-blur-sm z-50 shadow-lg shadow-blue-900/20">
      <div className="container mx-auto px-4 md:px-6">
        {/* Main navbar */}
        <div className="flex items-center justify-between gap-4 py-3 md:py-4 min-h-14">
          {/* Left section - Logo and Navigation */}
          <div className="flex items-center gap-6 lg:gap-8 min-w-0">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Heart className="h-5 w-5 text-white" fill="currentColor" />
              </div>
              <span className="text-lg font-bold text-white whitespace-nowrap drop-shadow-sm">HealthCompare</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 flex-shrink-0">
              {navLink("/", "Home")}
              {navLink("/comparison", "Compare")}
              {navLink("/lab-tests", "Lab Tests")}
              {navLink("/dashboard", "Dashboard")}
              {navLink("/price-comparison", "Prices")}
              {navLink("/insurance", "Insurance")}
            </nav>
          </div>

          {/* Right section - Search and Auth */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <form onSubmit={handleSearch} className="relative w-48 lg:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:ring-2 focus:ring-white/50 focus:border-white/50 text-sm"
              />
            </form>
            {currentUser ? (
              <div className="flex items-center gap-2">
                <Link to="/profile" className="flex items-center gap-2 hover:opacity-90 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-white/30 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0 border border-white/40">
                    {(currentUser.name || currentUser.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-white/95 truncate max-w-[120px] hidden lg:inline">{currentUser.name || currentUser.email}</span>
                </Link>
                <Button variant="outline" size="sm" className="border-2 border-white bg-white/10 text-white font-semibold hover:bg-white hover:text-blue-600 flex-shrink-0 shadow-sm" onClick={handleLogout}>Logout</Button>
              </div>
            ) : (
              <Link to="/login" className="flex-shrink-0">
                <Button size="sm" className="bg-white text-blue-600 hover:bg-white/90 font-semibold shadow-md">Sign In</Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            aria-label="Toggle menu"
            className="md:hidden p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu content */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 px-6 pb-4 bg-white/5 backdrop-blur">
            <form onSubmit={handleSearch} className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search doctors, specialties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70"
              />
            </form>
            <nav className="mt-4 flex flex-col gap-1">
              {[["/", "Home"], ["/comparison", "Compare"], ["/lab-tests", "Lab Tests"], ["/dashboard", "Dashboard"], ["/price-comparison", "Prices"], ["/insurance", "Insurance"]].map(([path, label]) => (
                <Link key={path} onClick={() => setIsMobileMenuOpen(false)} to={path} className={`py-2.5 px-3 rounded-lg ${location.pathname === path ? "bg-white/30 text-white font-medium" : "text-white/90 hover:bg-white/20"}`}>{label}</Link>
              ))}
              {currentUser && <Link onClick={() => setIsMobileMenuOpen(false)} to="/profile" className="py-2.5 px-3 rounded-lg text-white/90 hover:bg-white/20">Profile</Link>}
            </nav>
            {currentUser ? (
              <Button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} className="mt-4 w-full bg-white/20 text-white font-semibold border-2 border-white hover:bg-white hover:text-blue-600">Logout</Button>
            ) : (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="mt-4 w-full bg-white text-blue-600 hover:bg-white/90 font-semibold">Sign In</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;