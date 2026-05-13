import { useState } from "react";
import { X, User, Mail, Phone, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Profile } from "@/hooks/usePreferences";
import { toast } from "sonner";

interface EditProfileDialogProps {
  open: boolean;
  initial: Profile;
  onClose: () => void;
  onSave: (profile: Profile) => void;
}

const EditProfileDialog = ({ open, initial, onClose, onSave }: EditProfileDialogProps) => {
  const [form, setForm] = useState<Profile>(initial);

  if (!open) return null;

  const handleAvatar = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, avatar: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Nombre y email son obligatorios");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error("Email no válido");
      return;
    }
    onSave(form);
    toast.success("Perfil actualizado");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Editar perfil"
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-background rounded-t-3xl sm:rounded-3xl border border-border animate-slide-up overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="font-bold text-foreground">Editar perfil</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="p-2 rounded-full bg-muted">
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <label className="relative cursor-pointer group">
              <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center overflow-hidden">
                {form.avatar ? (
                  <img src={form.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-primary-foreground" />
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center border-2 border-background">
                <Camera className="w-3.5 h-3.5" />
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleAvatar(e.target.files[0])}
                aria-label="Cambiar foto de perfil"
              />
            </label>
            <p className="text-[10px] text-muted-foreground">Toca para cambiar foto</p>
          </div>

          <Field
            icon={User}
            label="Nombre completo"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            placeholder="Tu nombre"
          />
          <Field
            icon={Mail}
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            placeholder="tu@email.com"
          />
          <Field
            icon={Phone}
            label="Teléfono"
            type="tel"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
            placeholder="+52 55 1234 5678"
          />
        </div>

        <div className="p-4 border-t border-border flex gap-2 safe-bottom">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="hero" className="flex-1">
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
};

const Field = ({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) => (
  <label className="block">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <div className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted border border-border focus-within:border-primary transition-colors">
      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
    </div>
  </label>
);

export default EditProfileDialog;
