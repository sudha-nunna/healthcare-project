import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { BookAppointment } from "@/components/BookAppointment";

type PopupDentist = {
  _id: string;
  name: string;
  clinicName: string;
};

type OpenArgs = Partial<PopupDentist> & Pick<PopupDentist, "_id" | "name">;

type Ctx = {
  openBookAppointment: (args: OpenArgs) => void;
  closeBookAppointment: () => void;
};

const BookAppointmentModalContext = createContext<Ctx | null>(null);

export function BookAppointmentModalProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<PopupDentist | null>(null);

  const closeBookAppointment = useCallback(() => setSelected(null), []);

  const openBookAppointment = useCallback((args: OpenArgs) => {
    setSelected({
      _id: String(args._id),
      name: String(args.name || "Provider"),
      clinicName: String(args.clinicName || "Clinic"),
    });
  }, []);

  const value = useMemo(
    () => ({ openBookAppointment, closeBookAppointment }),
    [openBookAppointment, closeBookAppointment]
  );

  return (
    <BookAppointmentModalContext.Provider value={value}>
      {children}
      {selected && <BookAppointment dentist={selected} onClose={closeBookAppointment} />}
    </BookAppointmentModalContext.Provider>
  );
}

export function useBookAppointmentModal() {
  const ctx = useContext(BookAppointmentModalContext);
  if (!ctx) {
    throw new Error("useBookAppointmentModal must be used within BookAppointmentModalProvider");
  }
  return ctx;
}

