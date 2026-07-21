"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { ContactModal } from "./contact-modal";

interface ContactModalApi {
  openContact: () => void;
  closeContact: () => void;
}

const Ctx = createContext<ContactModalApi>({
  openContact: () => {},
  closeContact: () => {},
});

export function useContactModal() {
  return useContext(Ctx);
}

export function ContactModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openContact = useCallback(() => setOpen(true), []);
  const closeContact = useCallback(() => setOpen(false), []);
  return (
    <Ctx.Provider value={{ openContact, closeContact }}>
      {children}
      {open && <ContactModal onClose={closeContact} />}
    </Ctx.Provider>
  );
}
