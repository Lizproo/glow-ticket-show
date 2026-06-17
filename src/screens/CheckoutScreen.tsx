import { ArrowLeft, CreditCard, Shield, Check, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event } from "@/lib/data";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useTickets } from "@/hooks/useTickets";
import { toast } from "@/hooks/use-toast";

interface CheckoutScreenProps {
  event: Event;
  section: string;
  quantity: number;
  total: number;
  seats: string[];
  onBack: () => void;
  onComplete: () => void;
}

const cardSchema = z.object({
  number: z.string().regex(/^[0-9 ]{16,19}$/, "Número de tarjeta inválido (16 dígitos)"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Vencimiento inválido (MM/AA)"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV inválido"),
  holder: z.string().trim().min(3, "Nombre del titular requerido").max(80),
});

const transferSchema = z.object({
  account: z.string().trim().min(6, "Cuenta inválida").max(30),
  bank: z.string().trim().min(2, "Banco requerido").max(40),
});

const CheckoutScreen = ({ event, section, quantity, total, seats, onBack, onComplete }: CheckoutScreenProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer">("card");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const { purchase } = useTickets();

  // Card
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [holder, setHolder] = useState("");
  // Transfer
  const [account, setAccount] = useState("");
  const [bank, setBank] = useState("");

  const serviceFee = Math.round(total * 0.1);
  const grandTotal = total + serviceFee;

  const formatCard = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const handlePurchase = async () => {
    if (paymentMethod === "card") {
      const parsed = cardSchema.safeParse({ number, expiry, cvv, holder });
      if (!parsed.success) {
        toast({ title: "Datos inválidos", description: parsed.error.issues[0].message, variant: "destructive" });
        return;
      }
    } else {
      const parsed = transferSchema.safeParse({ account, bank });
      if (!parsed.success) {
        toast({ title: "Datos inválidos", description: parsed.error.issues[0].message, variant: "destructive" });
        return;
      }
    }

    setProcessing(true);
    try {
      await purchase(event, section, quantity, grandTotal, seats);
      setProcessing(false);
      setSuccess(true);
      setTimeout(onComplete, 1800);
    } catch (e) {
      setProcessing(false);
      toast({
        title: "Error en la compra",
        description: e instanceof Error ? e.message : "Intenta de nuevo",
        variant: "destructive",
      });
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 animate-fade-in">
        <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center animate-pulse-glow">
          <Check className="w-10 h-10 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground mt-6">¡Compra exitosa!</h2>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Tu ticket para {event.title} ha sido confirmado
        </p>
        <p className="text-xs text-muted-foreground mt-1">Redirigiendo a tus tickets...</p>
      </div>
    );
  }

  return (
    <div className="pb-28 gradient-mesh min-h-screen">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 safe-top">
        <button onClick={onBack} aria-label="Volver" className="p-2 rounded-full glass-strong text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Checkout</h1>
      </div>

      <div className="px-4 mt-2">
        <div className="glass-strong rounded-2xl p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">Resumen del pedido</h3>
          <div className="flex gap-3">
            <img src={event.image} alt={event.title} className="w-16 h-16 rounded-lg object-cover" loading="lazy" />
            <div className="flex-1">
              <p className="font-bold text-sm text-foreground">{event.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{event.venue}, {event.city}</p>
              <p className="text-xs text-muted-foreground">{section} · {quantity} ticket{quantity > 1 ? "s" : ""}</p>
              {seats.length > 0 && (
                <p className="text-[11px] text-secondary mt-1">Asientos: {seats.join(", ")}</p>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">${total} USD</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Cargo por servicio</span><span className="text-foreground">${serviceFee} USD</span></div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-border"><span className="text-foreground">Total</span><span className="text-secondary">${grandTotal} USD</span></div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-bold text-foreground mb-3">Método de pago</h3>
        <div className="flex flex-col gap-2">
          {([
            { id: "card", label: "Tarjeta de crédito/débito", Icon: CreditCard },
            { id: "transfer", label: "Transferencia bancaria", Icon: Building2 },
          ] as const).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setPaymentMethod(id)}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                paymentMethod === id ? "border-primary bg-primary/10" : "border-border bg-card"
              )}
            >
              <Icon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {paymentMethod === "card" && (
        <div className="px-4 mt-4">
          <div className="glass-strong rounded-2xl p-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Titular</label>
              <input
                type="text"
                value={holder}
                onChange={(e) => setHolder(e.target.value)}
                placeholder="Nombre como aparece en la tarjeta"
                maxLength={80}
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted text-foreground text-sm border border-border focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Número de tarjeta</label>
              <input
                type="text"
                inputMode="numeric"
                value={number}
                onChange={(e) => setNumber(formatCard(e.target.value))}
                placeholder="1234 5678 9012 3456"
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted text-foreground text-sm border border-border focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">Vencimiento</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/AA"
                  className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted text-foreground text-sm border border-border focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">CVV</label>
                <input
                  type="password"
                  inputMode="numeric"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="123"
                  className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted text-foreground text-sm border border-border focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {paymentMethod === "transfer" && (
        <div className="px-4 mt-4">
          <div className="glass-strong rounded-2xl p-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Banco</label>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted text-foreground text-sm border border-border focus:border-primary focus:outline-none"
              >
                <option value="">Selecciona un banco…</option>
                <optgroup label="México">
                  <option value="BBVA México">BBVA México</option>
                  <option value="Banamex">Banamex</option>
                  <option value="Santander México">Santander México</option>
                  <option value="Banorte">Banorte</option>
                  <option value="HSBC México">HSBC México</option>
                </optgroup>
                <optgroup label="Argentina">
                  <option value="Banco Nación">Banco Nación</option>
                  <option value="Banco Galicia">Banco Galicia</option>
                  <option value="Santander Argentina">Santander Argentina</option>
                  <option value="BBVA Argentina">BBVA Argentina</option>
                  <option value="Mercado Pago">Mercado Pago</option>
                </optgroup>
                <optgroup label="Colombia">
                  <option value="Bancolombia">Bancolombia</option>
                  <option value="Davivienda">Davivienda</option>
                  <option value="BBVA Colombia">BBVA Colombia</option>
                  <option value="Banco de Bogotá">Banco de Bogotá</option>
                  <option value="Nequi">Nequi</option>
                </optgroup>
                <optgroup label="Chile / Perú">
                  <option value="Banco de Chile">Banco de Chile</option>
                  <option value="BCI">BCI</option>
                  <option value="Santander Chile">Santander Chile</option>
                  <option value="BCP Perú">BCP Perú</option>
                  <option value="Interbank">Interbank</option>
                </optgroup>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Número de cuenta</label>
              <input
                type="text"
                inputMode="numeric"
                value={account}
                onChange={(e) => setAccount(e.target.value.replace(/\D/g, "").slice(0, 30))}
                placeholder="Cuenta de origen"
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted text-foreground text-sm border border-border focus:border-primary focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Recibirás los datos de la cuenta destino tras confirmar.
            </p>
          </div>
        </div>
      )}

      <div className="px-4 mt-4">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-4 h-4 text-primary" />
          <span>Pago seguro con encriptación SSL</span>
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/90 backdrop-blur-lg border-t border-border">
        <Button variant="hero" size="lg" className="w-full" onClick={handlePurchase} disabled={processing}>
          {processing ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Procesando...
            </span>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pagar ${grandTotal} USD
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CheckoutScreen;
