import { useMemo, useState } from "react";
import { API_BASE } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useToast } from "./ui/use-toast";

type Dentist = {
  _id: string;
  name: string;
  clinicName: string;
};

type FieldErrors = Partial<Record<"patientName" | "age" | "gender" | "appointmentDate", string>>;

export function BookAppointment({
  dentist,
  onClose,
}: {
  dentist: Dentist;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const minDate = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!patientName.trim() || patientName.trim().length < 2) {
      next.patientName = "Enter a valid patient name";
    }
    const ageNum = Number(age);
    if (!Number.isFinite(ageNum) || ageNum < 0 || ageNum > 120) {
      next.age = "Age must be between 0 and 120";
    }
    if (!gender) next.gender = "Select a gender";
    if (!appointmentDate) next.appointmentDate = "Select an appointment date";
    if (appointmentDate && appointmentDate < minDate) {
      next.appointmentDate = "Appointment date cannot be in the past";
    }
    return next;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/api/dentist-appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: patientName.trim(),
          age: Number(age),
          gender,
          appointmentDate,
          dentistName: dentist.name,
          clinicName: dentist.clinicName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      toast({
        title: "Appointment booked",
        description: `Your appointment with ${dentist.name} is confirmed.`,
      });
      setPatientName("");
      setAge("");
      setGender("");
      setAppointmentDate("");
      setErrors({});
      onClose();
    } catch (err: any) {
      toast({
        title: "Booking failed",
        description: err?.message || "Could not book appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="rounded-md bg-muted px-4 py-3 text-sm">
            <p className="font-medium">{dentist.name}</p>
            <p className="text-muted-foreground">{dentist.clinicName}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientName">Patient Name</Label>
            <Input
              id="patientName"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter full name"
            />
            {errors.patientName && (
              <p className="text-xs text-destructive">{errors.patientName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min={0}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
              {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-xs text-destructive">{errors.gender}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Appointment Date</Label>
            <Input
              id="date"
              type="date"
              min={minDate}
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
            />
            {errors.appointmentDate && (
              <p className="text-xs text-destructive">{errors.appointmentDate}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Booking…" : "Confirm Booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

