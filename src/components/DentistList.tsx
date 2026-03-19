import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { BookAppointment } from "./BookAppointment";

type Dentist = {
  _id: string;
  name: string;
  photo?: string;
  qualification?: string;
  experience?: number;
  clinicName: string;
  address: string;
  location?: string;
};

type DentistsResponse = {
  success: boolean;
  dentists: Dentist[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  message?: string;
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

export default function DentistList() {
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(9);

  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Dentist | null>(null);

  const queryString = useMemo(
    () =>
      buildQuery({
        q,
        location,
        page,
        limit,
      }),
    [q, location, page, limit]
  );

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/api/dentists${queryString}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = (await res.json()) as DentistsResponse;
        if (!res.ok) throw new Error(data.message || "Failed to load dentists");
        if (cancelled) return;
        setDentists(data.dentists || []);
        setTotalPages(data.totalPages || 1);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || "Failed to load dentists");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  // reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [q, location]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Find a Dentist</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Browse trusted dentists and book an appointment in seconds.
        </p>
      </div>

      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="q">Search</Label>
            <Input
              id="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, clinic, qualification, address..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loc">Location</Label>
            <Input
              id="loc"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City / area"
            />
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="py-10 text-center text-muted-foreground">Loading dentists…</div>
      ) : error ? (
        <div className="py-10 text-center text-destructive">{error}</div>
      ) : dentists.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground">
          No dentists found. Try a different search.
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dentists.map((d) => (
              <Card
                key={d._id}
                className="flex flex-col shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    {d.photo ? (
                      <img
                        src={d.photo}
                        alt={d.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold">
                        {d.name?.charAt(0)?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{d.name}</CardTitle>
                    <p className="text-xs text-muted-foreground truncate">
                      {d.qualification || "Dentist"}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-3 text-sm">
                  <div className="flex flex-wrap gap-2 text-muted-foreground">
                    {typeof d.experience === "number" && (
                      <span>{d.experience} yrs experience</span>
                    )}
                    {d.location && (
                      <span className="before:content-['•'] before:mr-1">{d.location}</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{d.clinicName}</p>
                    <p className="text-muted-foreground">{d.address}</p>
                  </div>
                  <div className="mt-4">
                    <Button className="w-full" onClick={() => setSelected(d)}>
                      Book Appointment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
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
        </>
      )}

      {selected && (
        <BookAppointment dentist={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

