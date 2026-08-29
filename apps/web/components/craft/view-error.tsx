"use client";

import * as React from "react";

import { PixelIcon } from "@/components/craft/pixel-icon";

/*
 * Si una query de Convex o un render revientan, hasta ahora el usuario veía una
 * pantalla en blanco: React desmonta el árbol y no queda nada. Este boundary
 * corta la caída en el nivel de la vista, así el nav y el resto del chrome
 * siguen en pie y hay un camino de salida.
 *
 * Tiene que ser una clase: getDerivedStateFromError / componentDidCatch no
 * existen como hooks.
 */
export class ViewErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Sin servicio de errores todavía: al menos que quede en la consola con su
    // stack de componentes, que es lo que hace falta para reproducirlo.
    console.error("Vista rota:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="term">
        <div className="term-bar">
          error ~ esta vista no pudo cargar
          <span className="term-hint">el resto de la app sigue en pie</span>
        </div>
        <div className="term-body">
          <div className="flex items-start gap-2.5">
            <PixelIcon
              name="cross"
              size={14}
              className="mt-0.5 text-[var(--rust)]"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold">Algo se rompió al renderizar</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Puede ser un fallo de red contra Convex o un dato inesperado.
              </p>
              {/* El mensaje crudo ayuda a reportar; el stack se queda en consola. */}
              <p className="data mt-3 truncate text-xs text-[var(--faint)]">
                {this.state.error.message}
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2.5">
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="btn btn-secondary btn-sm"
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn btn-ghost btn-sm"
            >
              Recargar la página
            </button>
          </div>
        </div>
      </div>
    );
  }
}
