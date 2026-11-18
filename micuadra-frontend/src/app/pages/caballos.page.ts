import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../api.service';
import { Avatar } from '../ui/avatar.component';
import { Caballo } from '../models';

@Component({
  selector: 'app-caballos',
  imports: [RouterLink, FormsModule, Avatar],
  template: `
    <div class="cabecera"><div><h1>Mis caballos</h1></div></div>

    <div class="rejilla">
      @for (c of caballos(); track c.id) {
        <a class="tarjeta caballo" [routerLink]="['/caballos', c.id]">
          <mc-avatar [nombre]="c.nombre" [foto]="c.foto" [tam]="96" />
          <strong>{{ c.nombre }}</strong>
          <span class="tenue pequeno">{{ detalle(c) }}</span>
        </a>
      }
      <form class="tarjeta nuevo" (ngSubmit)="crear()">
        <h2>Añadir caballo</h2>
        <label>Nombre<input name="nombre" [(ngModel)]="nuevo.nombre" required></label>
        <label>Raza<input name="raza" [(ngModel)]="nuevo.raza"></label>
        <label>Sexo
          <select name="sexo" [(ngModel)]="nuevo.sexo">
            <option>Macho</option><option>Macho castrado</option><option>Yegua</option>
          </select>
        </label>
        <button [disabled]="!nuevo.nombre">Añadir</button>
      </form>
    </div>
  `,
  styles: `
    .rejilla { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; align-items: start; }
    .nuevo { grid-column: 1 / -1; max-width: 420px; }
    .caballo { display: grid; justify-items: center; gap: 6px; padding: 24px 16px; text-align: center; color: var(--texto); text-decoration: none; }
    .caballo:hover { border-color: var(--acento); }
    .caballo strong { margin-top: 8px; font-size: 18px; }
    .nuevo { display: grid; gap: 10px; padding: 20px; border-style: dashed; background: transparent; }
    .nuevo input, .nuevo select { width: 100%; }
  `,
})
export class CaballosPage {
  private api = inject(Api);
  private router = inject(Router);
  caballos = signal<Caballo[]>([]);
  nuevo = { nombre: '', raza: '', sexo: 'Macho castrado' };

  constructor() { this.api.caballos().subscribe(c => this.caballos.set(c)); }

  detalle(c: Caballo) { return [c.raza, c.sexo].filter(Boolean).join(', ') || 'Sin datos'; }

  crear() { this.api.crearCaballo(this.nuevo).subscribe(c => this.router.navigate(['/caballos', c.id])); }
}
