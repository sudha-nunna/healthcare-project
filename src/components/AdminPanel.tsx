import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/lib/api";
import { Card } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import { AdminKeyGate, getAdminKey } from "./AdminKeyGate";

type AppointmentStatus = "Booked" | "Completed" | "Cancelled";

type Appointment = {
  _id: string;
  patientName: string;
  age: number;
  gender: string;
  appointmentDate: string;
  dentistName: string;
  clinicName: string;
  status: AppointmentStatus;
};

type AppointmentsResponse = {
  success: boolean;
  appointments: Appointment[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  message?: string;
};

type DentistCreateBody = {
  name: string;
  photo?: string;
  qualification?: string;
  experience?: number;
  clinicName: string;
  address: string;
  location?: string;
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined) return;
    const s = String(v).trim();
    if (!s) return;
    sp.set(k, s);
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export default function AdminPanel() {
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const query = useMemo(
    () => buildQuery({ page, limit, status: statusFilter === "all" ? undefined : statusFilter || undefined }),
    [page, limit, statusFilter]
  );

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add dentist form state
  const [creating, setCreating] = useState(false);
  const [dentist, setDentist] = useState<DentistCreateBody>({
    name: "",
    photo: "",
    qualification: "",
    experience: 0,
    clinicName: "",
    address: "",
    location: "",
  });
  const [dentistErrors, setDentistErrors] = useState<Record<string, string>>({});

  async function loadAppointments() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/dentist-appointments${query}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = (await res.json()) as AppointmentsResponse;
      if (!res.ok) throw new Error(data.message || "Failed to load appointments");
      setAppointments(data.appointments || []);
      setTotalPages(data.totalPages || 1);
    } catch (e: any) {
      setError(e?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function updateStatus(id: string, status: AppointmentStatus) {
    try {
      const adminKey = getAdminKey();
      const res = await fetch(`${API_BASE}/api/dentist-appointments/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(adminKey ? { "x-admin-key": adminKey } : {}),
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");
      toast({ title: "Updated", description: `Status set to ${status}` });
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status } : a))
      );
    } catch (e: any) {
      toast({
        title: "Update failed",
        description: e?.message || "Could not update status",
        variant: "destructive",
      });
    }
  }

  function validateDentist(body: DentistCreateBody) {
    const errs: Record<string, string> = {};
    if (!body.name.trim()) errs.name = "Name is required";
    if (!body.clinicName.trim()) errs.clinicName = "Clinic name is required";
    if (!body.address.trim()) errs.address = "Address is required";
    const exp = Number(body.experience ?? 0);
    if (!Number.isFinite(exp) || exp < 0 || exp > 60) errs.experience = "Experience must be 0–60";
    return errs;
  }

  async function createDentist(e: React.FormEvent) {
    e.preventDefault();
    const body: DentistCreateBody = {
      ...dentist,
      name: dentist.name.trim(),
      clinicName: dentist.clinicName.trim(),
      address: dentist.address.trim(),
      qualification: dentist.qualification?.trim() || "",
      location: dentist.location?.trim() || "",
      photo: dentist.photo?.trim() || "",
      experience: Number(dentist.experience || 0),
    };
    const errs = validateDentist(body);
    setDentistErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      setCreating(true);
      const adminKey = getAdminKey();
      const res = await fetch(`${API_BASE}/api/dentists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminKey ? { "x-admin-key": adminKey } : {}),
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add dentist");
      toast({ title: "Dentist added", description: `${body.name} added successfully.` });
      setDentist({
        name: "",
        photo: "",
        qualification: "",
        experience: 0,
        clinicName: "",
        address: "",
        location: "",
      });
      setDentistErrors({});
    } catch (e: any) {
      toast({
        title: "Add dentist failed",
        description: e?.message || "Could not add dentist",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage dentists and view all dentist appointments.
        </p>
      </div>

      <AdminKeyGate>
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-3">Add Dentist</h2>
          <form onSubmit={createDentist} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={dentist.name}
                onChange={(e) => setDentist((d) => ({ ...d, name: e.target.value }))}
              />
              {dentistErrors.name && (
                <p className="text-xs text-destructive">{dentistErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Photo URL</Label>
              <Input
                value={dentist.photo || ""}
                onChange={(e) => setDentist((d) => ({ ...d, photo: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Qualification</Label>
              <Input
                value={dentist.qualification || ""}
                onChange={(e) =>
                  setDentist((d) => ({ ...d, qualification: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Years of Experience</Label>
              <Input
                type="number"
                min={0}
                max={60}
                value={String(dentist.experience ?? 0)}
                onChange={(e) =>
                  setDentist((d) => ({ ...d, experience: Number(e.target.value) }))
                }
              />
              {dentistErrors.experience && (
                <p className="text-xs text-destructive">{dentistErrors.experience}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Clinic Name *</Label>
              <Input
                value={dentist.clinicName}
                onChange={(e) =>
                  setDentist((d) => ({ ...d, clinicName: e.target.value }))
                }
              />
              {dentistErrors.clinicName && (
                <p className="text-xs text-destructive">{dentistErrors.clinicName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={dentist.location || ""}
                onChange={(e) =>
                  setDentist((d) => ({ ...d, location: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Address *</Label>
              <Input
                value={dentist.address}
                onChange={(e) => setDentist((d) => ({ ...d, address: e.target.value }))}
              />
              {dentistErrors.address && (
                <p className="text-xs text-destructive">{dentistErrors.address}</p>
              )}
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={creating}>
                {creating ? "Adding…" : "Add Dentist"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <Label>Status filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Booked">Booked</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => loadAppointments()} disabled={loading}>
                Refresh
              </Button>
            </div>
          </div>
        </Card>

        <Card className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-muted-foreground">Loading appointments…</div>
          ) : error ? (
            <div className="p-6 text-destructive">{error}</div>
          ) : appointments.length === 0 ? (
            <div className="p-6 text-muted-foreground">No appointments found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Dentist</TableHead>
                  <TableHead>Clinic</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell>{a.patientName}</TableCell>
                    <TableCell>{a.age}</TableCell>
                    <TableCell>{a.gender}</TableCell>
                    <TableCell>
                      {new Date(a.appointmentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{a.dentistName}</TableCell>
                    <TableCell>{a.clinicName}</TableCell>
                    <TableCell>
                      <Select
                        value={a.status}
                        onValueChange={(v) => updateStatus(a._id, v as AppointmentStatus)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Booked">Booked</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page <span className="font-medium text-foreground">{page}</span> of{" "}
            <span className="font-medium text-foreground">{totalPages}</span>
          </div>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </AdminKeyGate>
    </div>
  );
}

