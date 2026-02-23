import { useParams, useNavigate } from "react-router-dom";
import { Star, MapPin, Calendar, GraduationCap, Award, Clock, DollarSign, Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";

const today = () => new Date().toISOString().split("T")[0];

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: specialistsData, isLoading } = useQuery({ queryKey: ["specialists"], queryFn: () => api.listSpecialists() });
  const specialist = ((specialistsData as any)?.specialists || []).find((s: any) => s._id === id);
  const { data: reviewsData } = useQuery({ queryKey: ["reviews", id], queryFn: () => api.getDoctorReviews(id!), enabled: !!id });
  const { data: slotsData } = useQuery({
    queryKey: ["slots", id, today()],
    queryFn: () => api.getSlots(id!, today()),
    enabled: !!id,
  });
  const avgRating = (reviewsData as any)?.stats?.average || 0;
  const totalReviews = (reviewsData as any)?.stats?.total || 0;
  const todaySlots: string[] = (slotsData as any)?.slots || [];
  const fee = specialist?.consultationFee ?? 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">HealthCompare</h1>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Button variant="ghost" onClick={() => navigate("/")}>Home</Button>
              <Button variant="ghost" onClick={() => navigate("/comparison")}>Compare</Button>
              <Button variant="ghost" onClick={() => navigate("/lab-tests")}>Lab Tests</Button>
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>Dashboard</Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Doctor Info Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="w-32 h-32 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center text-5xl font-semibold text-primary">
                    {(specialist?.name || "?").charAt(0)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">{specialist?.name || (isLoading ? 'Loading...' : 'Unknown')}</h1>
                        <p className="text-lg text-muted-foreground">{specialist?.specialty || ''}</p>
                      </div>
                      <Badge variant="secondary" className="text-base px-4 py-2">
                        Available Today
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-warning text-warning" />
                        <span className="font-semibold text-lg">{Number(avgRating).toFixed(1)}</span>
                        <span className="text-muted-foreground">({totalReviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-5 w-5" />
                        <span>{specialist?.experienceYears ? `${specialist.experienceYears} years experience` : "Experience not provided"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-5 w-5" />
                      <span>{specialist?.hospital || ''}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Education
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Education details not provided</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Specializations
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Cardiology</Badge>
                      <Badge variant="outline">Heart Disease</Badge>
                      <Badge variant="outline">Preventive Cardiology</Badge>
                      <Badge variant="outline">Cardiac Imaging</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-semibold">About</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">No biography available.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                {(reviewsData as any)?.reviews?.map((review: any, idx: number) => (
                  <Card key={idx}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{review.userId?.name || 'Anonymous'}</h4>
                          <p className="text-sm text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          <span className="font-medium">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="location">
                <Card>
                  <CardContent className="p-6">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                      <MapPin className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">{specialist?.hospital || 'Hospital'}</h4>
                      <p className="text-muted-foreground">Address not provided</p>
                      <p className="text-muted-foreground"></p>
                      <p className="text-sm text-muted-foreground">Phone: (555) 123-4567</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-8 w-8 text-primary" />
                    <span className="text-4xl font-bold">${fee}</span>
                  </div>
                  <p className="text-muted-foreground">per consultation</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="font-semibold mb-3">Available Slots Today</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {todaySlots.length > 0 ? todaySlots.slice(0, 6).map((t) => (
                        <span key={t} className="text-sm py-1 px-2 rounded bg-muted text-center">{t}</span>
                      )) : (
                        <div className="text-muted-foreground col-span-2">Slots not available for today. Book to see more dates.</div>
                      )}
                    </div>
                  </div>
                </div>

                <Button className="w-full mb-3" size="lg" onClick={() => navigate(`/book-appointment?doctor=${id}`)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
                
                <Button variant="outline" className="w-full" onClick={() => navigate("/comparison?selected=" + id)}>
                  Add to Compare
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => {
                  const key = "healthcompare_saved_doctors";
                  const raw = localStorage.getItem(key);
                  const list = raw ? JSON.parse(raw) : [];
                  if (list.some((d: any) => d.id === id)) { toast.info("Already saved"); return; }
                  list.push({ id, name: specialist?.name, specialization: specialist?.specialty, fee });
                  localStorage.setItem(key, JSON.stringify(list));
                  toast.success("Saved to Dashboard. View under Saved tab.");
                }}>
                  Save to Dashboard
                </Button>

                <div className="mt-6 pt-6 border-t space-y-2 text-sm text-muted-foreground">
                  <p>✓ Instant confirmation</p>
                  <p>✓ Free cancellation up to 24hrs</p>
                  <p>✓ Patient insurance accepted</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
