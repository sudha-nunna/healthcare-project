import { SearchBar } from "@/components/SearchBar";
import { FilterBar } from "@/components/FilterBar";
import { DoctorCard } from "@/components/DoctorCard";
import { Button } from "@/components/ui/button";
import { Heart, Users, Award, TrendingUp } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import heroImage from "@/assets/hero-healthcare.jpg";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useMemo, useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("");
  const [ratingFilter, setRatingFilter] = useState<string>("");

  const filterText = searchQuery || specialtyFilter;
  const { data, isLoading } = useQuery({
    queryKey: ["specialists", "featured", filterText],
    queryFn: () => filterText ? api.listSpecialists(filterText) : api.listSpecialists(),
  });
  const allDoctors = (data as any)?.specialists || [];
  const featuredDoctors = useMemo(() => {
    let list = allDoctors.map((s: any) => ({
    id: s._id,
      name: s.name,
      specialization: s.specialty,
      rating: s.rating || 0,
      reviews: s.reviews || 0,
      fee: s.consultationFee || 0,
      location: s.location || s.hospital || "",
      availableToday: (s.services?.sameDayAppointment || false) as boolean,
    }));
    if (ratingFilter === "4") list = list.filter((d: any) => d.rating >= 4);
    if (ratingFilter === "3") list = list.filter((d: any) => d.rating >= 3);
    return list;
  }, [allDoctors, ratingFilter]);

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    navigate(`/?search=${encodeURIComponent(query.trim())}`, { replace: true });
  };

  const scrollToDoctors = () => document.getElementById("doctors-section")?.scrollIntoView({ behavior: "smooth" });

  return (
        <div className="min-h-screen bg-background pt-20">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--primary)_0%,transparent_50%)] opacity-[0.07]" aria-hidden />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Find & Compare Healthcare Services
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Compare prices, read reviews, and book appointments with top-rated doctors and hospitals
            </p>
            <SearchBar onSearch={handleSearch} placeholder="Search by specialty (e.g. Cardiologist)..." />
          </div>

          <div className="mt-12">
            <img 
              src={heroImage} 
              alt="Healthcare professionals" 
              className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-card border-y">
        <div className="container mx-auto px-4">
          <FilterBar
            specialty={specialtyFilter}
            onSpecialtyChange={setSpecialtyFilter}
            rating={ratingFilter}
            onRatingChange={setRatingFilter}
            onClear={() => { setSpecialtyFilter(""); setRatingFilter(""); navigate("/"); }}
          />
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2">10,000+</h3>
              <p className="text-muted-foreground">Verified Doctors</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2">500+</h3>
              <p className="text-muted-foreground">Hospitals</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2">4.8/5</h3>
              <p className="text-muted-foreground">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2">50K+</h3>
              <p className="text-muted-foreground">Happy Patients</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section id="doctors-section" className="py-16 scroll-mt-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Top-Rated Healthcare Providers</h2>
            <p className="text-lg text-muted-foreground">
              Connect with highly qualified doctors and specialists
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {isLoading ? (
              <div className="text-muted-foreground col-span-full text-center py-8">Loading specialists...</div>
            ) : featuredDoctors.length === 0 ? (
              <div className="text-muted-foreground col-span-full text-center py-8">No doctors match your filters. Try a different search or clear filters.</div>
            ) : (
              featuredDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} {...doctor} />
              ))
            )}
          </div>

          <div className="text-center">
            <Button size="lg" variant="outline" onClick={scrollToDoctors}>
              View All Doctors
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary-dark text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Take Control of Your Healthcare?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Compare prices, book appointments, and save on healthcare services
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate("/comparison")}>
              Compare Providers
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary" onClick={() => navigate("/lab-tests")}>
              Book Lab Test
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">HealthCompare</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your trusted platform for comparing healthcare services and making informed decisions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button type="button" onClick={scrollToDoctors} className="hover:text-primary transition-colors text-left">Find Doctors</button></li>
                <li><button type="button" onClick={() => navigate("/book-appointment")} className="hover:text-primary transition-colors text-left">Book Appointments</button></li>
                <li><button type="button" onClick={() => navigate("/lab-tests")} className="hover:text-primary transition-colors text-left">Lab Tests</button></li>
                <li><button type="button" onClick={() => navigate("/price-comparison")} className="hover:text-primary transition-colors text-left">Compare Prices</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#doctors-section" onClick={(e) => { e.preventDefault(); scrollToDoctors(); }} className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="mailto:contact@healthcompare.com" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 HealthCompare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
