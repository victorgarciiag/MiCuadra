import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../api.service';
import { Avatar } from '../ui/avatar.component';
import { Caballo, Concurso } from '../models';

@Component({
  selector: 'app-concursos',
  imports: [FormsModule, DatePipe, Avatar],
  template: `
    <div class="cabecera">
      <div><h1>Concursos</h1><p>Los próximos a los que vais</p></div>
    </div>

    <div class="columnas formulario-lado">
      <section class="tarjeta">
        <ul class="filas">
          @for (k of concursos(); track k.id) {
            <li>
              <div class="fecha"><b>{{ k.fechaInicio | date:'d' }}</b><span>{{ k.fechaInicio | date:'MMM' }}</span></div>
              <div class="principal">
                <strong>{{ k.nombre }}</strong>
                <span class="tenue pequeno">{{ k.fechaInicio | date:'EEEE' }}@if (k.lugar) {, {{ k.lugar }}}</span>
              </div>
              <span class="caballos">
                @for (c of k.caballos; track c.id) { <mc-avatar [nombre]="c.nombre" [tam]="26" [attr.title]="c.nombre" /> }
              </span>
              <button class="quitar" (click)="borrar(k)" aria-label="Borrar concurso">✕</button>
            </li>
          } @empty { <li class="vacio">No hay concursos apuntados</li> }
        </ul>
      </section>

      <section class="tarjeta">
        <header><h2>Apuntar concurso</h2></header>
        <form class="formulario" (ngSubmit)="crear()">
          <label>Nombre<input name="nombre" [(ngModel)]="nuevo.nombre" placeholder="CSN 2* Sevilla" required></label>
          <div class="dos">
            <label>Fecha<input type="date" name="fecha" [(ngModel)]="nuevo.fechaInicio"></label>
            <label>Lugar<input name="lugar" [(ngModel)]="nuevo.lugar"></label>
          </div>
          <div class="checks">
            <span class="pequeno tenue">Caballos que van</span>
            @for (c of caballos(); track c.id) {
              <label class="check"><input type="checkbox" [checked]="nuevo.caballoIds.includes(c.id)" (change)="alternar(c.id)"> {{ c.nombre }}</label>
            }
          </div>
          <button [disabled]="!nuevo.nombre || !nuevo.fechaInicio">Apuntar concurso</button>
        </form>
      </section>
    </div>
  `,
  styles: `
    .caballos { display: flex; gap: 4px; }
    .checks { display: grid; gap: 8px; }
  `,
})
export class ConcursosPage {
  private api = inject(Api);
  concursos = signal<Concurso[]>([]);
  caballos = signal<Caballo[]>([]);
  nuevo = this.vacio();

  constructor() {
    this.cargar();
    this.api.caballos().subscribe(c => this.caballos.set(c));
  }

  alternar(id: number) {
    const ids = this.nuevo.caballoIds;
    this.nuevo.caballoIds = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
  }

  crear() {
    this.api.crearConcurso(this.nuevo).subscribe(() => {
      this.nuevo = this.vacio();
      this.cargar();
    });
  }

  borrar(k: Concurso) {
    if (confirm(`¿Borrar ${k.nombre}?`)) this.api.borrarConcurso(k.id).subscribe(() => this.cargar());
  }

  private cargar() { this.api.concursos().subscribe(k => this.concursos.set(k)); }
  private vacio() { return { nombre: '', lugar: '', fechaInicio: '', caballoIds: [] as number[] }; }
}
