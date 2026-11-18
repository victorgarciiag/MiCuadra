import { Component, computed, input } from '@angular/core';

const COLORES = ['#2D6A4F', '#8C5A3C', '#5B6C8F', '#A0703A', '#6B5B95', '#3E7C7B'];

/** Foto del caballo o, si no tiene, un cuadrado con la inicial y un color fijo por nombre. */
@Component({
  selector: 'mc-avatar',
  template: `
    @if (foto()) {
      <img [src]="foto()" [alt]="nombre()" [style.width.px]="tam()" [style.height.px]="tam()">
    } @else {
      <span [style.background]="color()" [style.width.px]="tam()" [style.height.px]="tam()" [style.font-size.px]="tam() * .42">{{ inicial() }}</span>
    }
  `,
  styles: `
    :host { display: inline-flex; flex: none; }
    span, img { display: inline-grid; place-items: center; border-radius: 30%; }
    span { color: #fff; font-weight: 700; }
    img { object-fit: cover; }
  `,
})
export class Avatar {
  nombre = input.required<string>();
  foto = input<string | undefined>();
  tam = input(36);
  inicial = computed(() => this.nombre().charAt(0).toUpperCase());
  color = computed(() => COLORES[[...this.nombre()].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 997, 7) % COLORES.length]);
}
