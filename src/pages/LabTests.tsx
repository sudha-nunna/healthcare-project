import { useState, useMemo } from "react";
import { FlaskConical } from "lucide-react";
import { LabTestCard } from "@/components/LabTestCard";
import { SearchBar } from "@/components/SearchBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

const LabTests = () => {
  const [searchInput, setSearchInput] = useState("");

  const { data } = useQuery({ queryKey: ["prices"], queryFn: () => api.getPrices() });
  const priceData = (data as any)?.prices || {};

  const toCards = (services: string[]): Array<{ id: string; name:string; description:string; price:number; duration:string; homeCollection:boolean; popular?:boolean}> => {
    return services.map((id) => {
      const hospitals = Object.entries(priceData[id] || {});
      const minPrice = hospitals.length ? Math.min(...hospitals.map(([,p]) => Number(p))) : 0;
      const prettyName = id.replace(/(^.|_.)/g, (m) => m.replace('_',' ').toUpperCase());
      return {
        id,
        name: prettyName,
        description: `Best available price across ${hospitals.length || 0} providers`,
        price: minPrice,
        duration: id.includes('panel') ? '48 hours' : '24 hours',
        homeCollection: true,
        popular: true,
      }
    });
  };

  const serviceKeys: string[] = Object.keys(priceData);
  const allCards = useMemo(() => toCards(serviceKeys), [priceData, serviceKeys.join(",")]);
  const filteredCards = useMemo(() => {
    if (!searchInput.trim()) return allCards;
    const q = searchInput.trim().toLowerCase();
    return allCards.filter((c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
  }, [allCards, searchInput]);
  const popularTests = toCards(serviceKeys.slice(0, 3));
  const diagnosticTests = toCards(serviceKeys.slice(3, 6));
  const packageTests = toCards(serviceKeys.slice(6, 8));

  const handleBookTest = (name: string) => {
    toast.success(`Lab test request received for "${name}". Our team will contact you shortly to schedule.`);
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-accent/10 via-background to-primary/10 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FlaskConical className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Lab Tests & Diagnostics</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Book lab tests online with home sample collection and get reports digitally
            </p>
            <SearchBar placeholder="Search for lab tests..." onSearch={(q) => setSearchInput(q)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
            <div className="bg-card p-6 rounded-lg text-center">
              <h3 className="font-semibold text-2xl text-foreground mb-2">500+</h3>
              <p className="text-muted-foreground">Tests Available</p>
            </div>
            <div className="bg-card p-6 rounded-lg text-center">
              <h3 className="font-semibold text-2xl text-foreground mb-2">24-48hrs</h3>
              <p className="text-muted-foreground">Fast Results</p>
            </div>
            <div className="bg-card p-6 rounded-lg text-center">
              <h3 className="font-semibold text-2xl text-foreground mb-2">100%</h3>
              <p className="text-muted-foreground">Safe & Hygienic</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tests Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="popular" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
              <TabsTrigger value="packages">Packages</TabsTrigger>
            </TabsList>

            <TabsContent value="popular">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(searchInput ? filteredCards : popularTests).map((test) => (
                  <LabTestCard key={test.id} name={test.name} description={test.description} price={test.price} duration={test.duration} homeCollection={test.homeCollection} popular={test.popular} onBookTest={() => handleBookTest(test.name)} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="diagnostic">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(searchInput ? filteredCards : diagnosticTests).map((test) => (
                  <LabTestCard key={test.id} name={test.name} description={test.description} price={test.price} duration={test.duration} homeCollection={test.homeCollection} popular={test.popular} onBookTest={() => handleBookTest(test.name)} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="packages">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {(searchInput ? filteredCards : packageTests).map((test) => (
                  <LabTestCard key={test.id} name={test.name} description={test.description} price={test.price} duration={test.duration} homeCollection={test.homeCollection} popular={test.popular} onBookTest={() => handleBookTest(test.name)} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground text-2xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Select Test</h3>
              <p className="text-sm text-muted-foreground">Choose from 500+ lab tests</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground text-2xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Schedule Collection</h3>
              <p className="text-sm text-muted-foreground">Book a convenient time slot</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground text-2xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Sample Collection</h3>
              <p className="text-sm text-muted-foreground">Trained phlebotomist visits your home</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground text-2xl font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2">Get Reports</h3>
              <p className="text-sm text-muted-foreground">Receive digital reports online</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LabTests;
