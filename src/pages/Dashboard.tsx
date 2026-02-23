import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Calendar, FileText, Bookmark, DollarSign, TrendingDown, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

const SAVED_DOCTORS_KEY = "healthcompare_saved_doctors";

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [savedProviders, setSavedProviders] = useState<Array<{ id: string; name: string; specialization: string; fee: number }>>(() => {
    try {
      const raw = localStorage.getItem(SAVED_DOCTORS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("token");
  const { data } = useQuery({ queryKey: ["profile"], queryFn: () => api.getProfile(), retry: false, enabled: hasToken });
  const user = (data as any)?.user || null;
  const allAppointments = (data as any)?.appointments || [];
  const appointments = (allAppointments || []).filter((a: any) => a.status !== "cancelled");

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Appointment cancelled");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const recentReports = [
    { name: "Complete Blood Count", date: "Feb 28, 2025", status: "Available" },
    { name: "Lipid Panel", date: "Feb 15, 2025", status: "Available" },
    { name: "Thyroid Function Test", date: "Jan 20, 2025", status: "Available" },
  ];

  const costInsights = {
    totalSpent: 845,
    savedAmount: 235,
    thisMonth: 150,
  };

  if (!hasToken) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Sign in to view your dashboard</p>
          <Button onClick={() => navigate("/login")}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">

            <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user?.name || 'User'}!</h1>
            <p className="text-muted-foreground">Here's your healthcare overview</p>
          </div>
          <div className="flex gap-2">
            <Link to="/profile">
              <Button variant="outline" size="sm"><User className="h-4 w-4 mr-2" />Profile</Button>
            </Link>
            <Link to="/insurance">
              <Button variant="outline" size="sm"><Shield className="h-4 w-4 mr-2" />Insurance</Button>
            </Link>
          </div>
        </div>

        {/* Cost Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="outline">All Time</Badge>
              </div>
              <h3 className="text-2xl font-bold mb-1">${costInsights.totalSpent}</h3>
              <p className="text-sm text-muted-foreground">Total Healthcare Spending</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-success" />
                </div>
                <Badge variant="secondary">Saved</Badge>
              </div>
              <h3 className="text-2xl font-bold mb-1">${costInsights.savedAmount}</h3>
              <p className="text-sm text-muted-foreground">Amount Saved by Comparing</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
                <Badge variant="outline">This Month</Badge>
              </div>
              <h3 className="text-2xl font-bold mb-1">${costInsights.thisMonth}</h3>
              <p className="text-sm text-muted-foreground">Current Month Spending</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="appointments" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 mb-8">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {appointments.map((appointment: any) => (
                  <div key={appointment._id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{appointment.doctorId?.name}</h4>
                        <p className="text-sm text-muted-foreground">{appointment.doctorId?.specialty}</p>
                      </div>
                      <Badge variant="outline">In-person</Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="font-medium text-primary">{appointment.date}, {appointment.time}</p>
                      <p className="text-muted-foreground">{appointment.doctorId?.hospital}</p>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/book-appointment?doctor=${appointment.doctorId?._id}`)}>Reschedule</Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => cancelMutation.mutate(appointment._id)} disabled={cancelMutation.isPending}>Cancel</Button>
                    </div>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No upcoming appointments</p>
                    <Button className="mt-4" onClick={() => navigate("/")}>
                      Book Appointment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-primary" />
                  Saved Providers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {savedProviders.length === 0 ? (
                  <p className="text-center py-6 text-muted-foreground">Save doctors from their profile to see them here.</p>
                ) : savedProviders.map((provider) => (
                  <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <h4 className="font-semibold">{provider.name}</h4>
                      <p className="text-sm text-muted-foreground">{provider.specialization}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">${provider.fee}</span>
                      <Button size="sm" onClick={() => navigate(`/book-appointment?doctor=${provider.id}`)}>Book</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Medical Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentReports.map((report, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <h4 className="font-semibold">{report.name}</h4>
                      <p className="text-sm text-muted-foreground">{report.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{report.status}</Badge>
                      <Button size="sm" variant="outline" onClick={() => { const blob = new Blob([`Report: ${report.name}\nDate: ${report.date}\nStatus: ${report.status}`], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${report.name.replace(/\s+/g, "-")}.txt`; a.click(); URL.revokeObjectURL(a.href); toast.success("Download started"); }}>Download</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle>Healthcare Cost Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Spending Breakdown</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Doctor Consultations</span>
                          <span className="text-sm font-medium">$450 (53%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: "53%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Lab Tests</span>
                          <span className="text-sm font-medium">$295 (35%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: "35%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Other Services</span>
                          <span className="text-sm font-medium">$100 (12%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-secondary" style={{ width: "12%" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <h4 className="font-semibold mb-3">Savings Tips</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-success">✓</span>
                        <span>You saved $85 by comparing prices before booking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success">✓</span>
                        <span>Consider lab test packages for better value</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success">✓</span>
                        <span>Video consultations cost 30% less on average</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
