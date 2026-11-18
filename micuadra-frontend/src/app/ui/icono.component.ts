import { Component, input } from '@angular/core';

const ICONOS: Record<string, string> = {
  inicio: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  caballos: 'M4 20V9l4-4h3l2 3 5 1 2 3-2 2-3-1v7M8 20v-5',
  concursos: 'M4 4v16M20 4v16M4 9h16M4 14h16',
  personas: 'M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 20v-1a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  mas: 'M12 5v14M5 12h14',
  gastos: 'M3 7h18v12H3zM3 11h18M7 15h3',
  camara: 'M4 8h3l2-3h6l2 3h3v11H4zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  buscar: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.5-3.5',
  campana: 'M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0',
  izquierda: 'M15 18l-6-6 6-6',
  derecha: 'M9 18l6-6-6-6',
};

@Component({
  selector: 'mc-icono',
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="d()"/></svg>`,
  styles: `:host { display: inline-flex; } svg { width: 19px; height: 19px; }`,
})
export class Icono {
  nombre = input.required<string>();
  d = () => ICONOS[this.nombre()] ?? '';
}
