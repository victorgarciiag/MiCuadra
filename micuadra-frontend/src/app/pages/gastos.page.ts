import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../api.service';
import { CATEGORIAS, CategoriaGasto, Gasto, mesActual } from '../models';

interface Linea { nombre: string; importe: number; }

@Component({
  selector: 'app-gastos',
  imports: [FormsModule, CurrencyPipe, DatePipe, RouterLink],
  template: `
    <div class="cabecera">
      <div><h1>Gastos</h1><p>Lo que te cuestan tus caballos</p></div>
      <label>Mes<input type="month" [(ngModel)]="mes" (change)="cargar()"></label>
    </div>

    <div class="columnas">
      <section class="tarjeta">
        <header><h2>Total del mes</h2><b class="total">{{ total() | currency:'EUR' }}</b></header>
        <div class="barras">
          @for (l of porCategoria(); track l.nombre) {
            <div class="barra">
              <span>{{ l.nombre }}</span>
              <span class="pista"><span [style.width.%]="(l.importe / maximo(porCategoria())) * 100"></span></span>
              <span class="importe">{{ l.importe | currency:'EUR':'symbol':'1.0-0' }}</span>
            </div>
          } @empty { <p class="tenue">Sin gastos este mes.</p> }
        </div>
      </section>

      <section class="tarjeta">
        <header><h2>Por caballo</h2></header>
        <div class="barras">
          @for (l of porCaballo(); track l.nombre) {
            <div class="barra">
              <span>{{ l.nombre }}</span>
              <span class="pista"><span [style.width.%]="(l.importe / maximo(porCaballo())) * 100"></span></span>
              <span class="importe">{{ l.importe | currency:'EUR':'symbol':'1.0-0' }}</span>
            </div>
          } @empty { <p class="tenue">Sin gastos este mes.</p> }
        </div>
      </section>
    </div>

    <section class="tarjeta lista">
      <header><h2>Detalle</h2><span class="tenue pequeno">Para apuntar un gasto, entra en el caballo</span></header>
      <ul class="filas">
        @for (g of gastos(); track g.id) {
          <li>
            <div class="fecha"><b>{{ g.fecha | date:'d' }}</b><span>{{ g.fecha | date:'MMM' }}</span></div>
            <div class="principal">
              <a [routerLink]="['/caballos', g.caballo.id]">{{ g.concepto || CATEGORIAS[g.categoria] }}</a>
              <span class="tenue pequeno">{{ g.caballo.nombre }}, {{ CATEGORIAS[g.categoria].toLowerCase() }}</span>
            </div>
            <strong>{{ g.importe | currency:'EUR' }}</strong>
          </li>
        } @empty { <li class="vacio">No hay gastos en este mes</li> }
      </ul>
    </section>
  `,
  styles: `
    .total { font-size: 18px; }
    .barras { display: grid; gap: 12px; padding: 18px 20px; }
    .barra { display: grid; grid-template-columns: 100px 1fr 70px; gap: 12px; align-items: center; font-size: 14px; }
    .pista { height: 12px; border-radius: 4px; background: var(--fondo); overflow: hidden; }
    .pista span { display: block; height: 100%; background: var(--acento); border-radius: 0 4px 4px 0; }
    .importe { text-align: right; font-weight: 600; font-variant-numeric: tabular-nums; }
    .lista { margin-top: 20px; }
  `,
})
export class GastosPage {
  private api = inject(Api);
  readonly CATEGORIAS = CATEGORIAS;
  mes = mesActual();
  gastos = signal<Gasto[]>([]);

  total = computed(() => this.gastos().reduce((t, g) => t + Number(g.importe), 0));
  porCategoria = computed(() => agrupar(this.gastos(), g => CATEGORIAS[g.categoria as CategoriaGasto]));
  porCaballo = computed(() => agrupar(this.gastos(), g => g.caballo.nombre));

  constructor() { this.cargar(); }

  cargar() { this.api.gastosDelMes(this.mes).subscribe(g => this.gastos.set(g)); }

  maximo(lineas: Linea[]) { return Math.max(1, ...lineas.map(l => l.importe)); }
}

function agrupar(gastos: Gasto[], clave: (g: Gasto) => string): Linea[] {
  const mapa = new Map<string, number>();
  gastos.forEach(g => mapa.set(clave(g), (mapa.get(clave(g)) ?? 0) + Number(g.importe)));
  return [...mapa].map(([nombre, importe]) => ({ nombre, importe })).sort((a, b) => b.importe - a.importe);
}
