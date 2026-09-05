import { createContext, useContext, useState, ReactNode } from "react";
import type { MembershipTier } from "@/lib/data";

export interface OrderData {
  tier: MembershipTier;
  fullName: string;
  phone: string;
  email: string;
  nationalId: string;
  agree: boolean;
  region: string;
  city: string;
  district: string;
  street: string;
  deliveryDate: string;
  orderNumber: string;
}

const defaultOrder: OrderData = {
  tier: "gold",
  fullName: "",
  phone: "",
  email: "",
  nationalId: "",
  agree: false,
  region: "",
  city: "",
  district: "",
  street: "",
  deliveryDate: "",
  orderNumber: "",
};

interface OrderContextType {
  order: OrderData;
  update: (data: Partial<OrderData>) => void;
  reset: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [order, setOrder] = useState<OrderData>(defaultOrder);
  const update = (data: Partial<OrderData>) => setOrder((prev) => ({ ...prev, ...data }));
  const reset = () => setOrder(defaultOrder);
  return (
    <OrderContext.Provider value={{ order, update, reset }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used within OrderProvider");
  return ctx;
}
