import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function TopNav() {
  return (
    <header className="flex justify-between items-center w-full h-16 px-6 sticky top-0 z-30 bg-bg-elevated/90 backdrop-blur-sm border-b border-border-subtle shadow-sm">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary w-4 h-4 group-focus-within:text-primary transition-colors" />
          <Input 
            className="w-full pl-9 pr-4 h-9 bg-bg-sunken border-transparent focus-visible:border-primary focus-visible:ring-primary/20 text-sm" 
            placeholder="Buscar en mis cursos, tareas..." 
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 ml-6">
        <button className="relative hover:bg-bg-sunken rounded-full p-2 transition-colors text-text-secondary">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-bg-elevated"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-border-subtle">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-text-primary leading-tight">Sofía M.</p>
            <p className="text-[10px] font-medium text-text-tertiary tracking-wide uppercase">Estudiante</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-border-subtle flex items-center justify-center text-primary font-bold text-sm">
            SM
          </div>
        </div>
      </div>
    </header>
  );
}
