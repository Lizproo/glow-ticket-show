import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface AnimatedQRProps {
  value: string;
  size?: number;
}

const CYCLE = 15;

const AnimatedQR = ({ value, size = 180 }: AnimatedQRProps) => {
  const [dataUrl, setDataUrl] = useState<string>("");
  const [tick, setTick] = useState(0);
  const [seconds, setSeconds] = useState(CYCLE);

  // Refrescar QR cada 15s con nueva semilla
  useEffect(() => {
    const generate = async () => {
      const url = await QRCode.toDataURL(`${value}|t=${Date.now()}|n=${tick}`, {
        margin: 1,
        width: size * 2,
        color: { dark: "#1a0608", light: "#00000000" },
        errorCorrectionLevel: "H",
      });
      setDataUrl(url);
    };
    generate();
  }, [value, tick, size]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setTick((t) => t + 1);
          return CYCLE;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const progress = (seconds / CYCLE) * 100;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative rounded-2xl p-3 bg-glow-cream" style={{ width: size + 24, height: size + 24 }}>
        <div
          className="absolute inset-0 rounded-2xl opacity-70"
          style={{
            background: `conic-gradient(from ${tick * 90}deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--primary)))`,
            filter: "blur(8px)",
            animation: "spin 4s linear infinite",
          }}
          aria-hidden
        />
        <div className="relative bg-glow-cream rounded-xl p-2">
          {dataUrl ? (
            <img src={dataUrl} alt="Código QR del ticket" width={size} height={size} className="block animate-fade-in" key={tick} />
          ) : (
            <div style={{ width: size, height: size }} className="bg-muted rounded animate-pulse" />
          )}
        </div>
      </div>

      <div className="w-full max-w-[200px]">
        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Código en vivo
          </span>
          <span>Renueva en {seconds}s</span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full gradient-primary transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

export default AnimatedQR;
