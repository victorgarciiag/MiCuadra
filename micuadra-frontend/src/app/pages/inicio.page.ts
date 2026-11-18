import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Api } from '../api.service';
import { Avatar } from '../ui/avatar.component';
import { Icono } from '../ui/icono.component';
import { Aviso, Concurso, Evento, TIPOS_SALUD, TipoEvento, hoyIso, isoDe, mesActual } from '../models';

interface Dia { iso: string; fecha: Date; eventos: Evento[]; }

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, DatePipe, CurrencyPipe, Avatar, Icono],
  template: `
    <div class="cabecera">
      <div>
        <h1>{{ saludo }}</h1>
        <p>{{ hoy | date:'EEEE, d \\'de\\' MMMM' }}, así va tu semana</p>
      </div>
      <a class="boton secundario gasto-mes" routerLink="/gastos">Este mes llevas <b>{{ gastoMes() | currency:'EUR':'symbol':'1.0-0' }}</b> en gastos</a>
    </div>

    <div class="seccion-titulo">
      <h2>Esta semana</h2>
      <div class="navegacion">
        <button class="secundario" (click)="irASemana(semana() - 1)" aria-label="Semana anterior"><mc-icono nombre="izquierda" /></button>
        <button class="secundario" (click)="irASemana(0)" [disabled]="semana() === 0">Hoy</button>
        <button class="secundario" (click)="irASemana(semana() + 1)" aria-label="Semana siguiente"><mc-icono nombre="derecha" /></button>
      </div>
    </div>

    <section class="tarjeta calendario">
      @for (d of dias(); track d.iso) {
        <div class="dia" [class.hoy]="d.iso === hoyIso" [class.sin-eventos]="!d.eventos.length && d.iso !== hoyIso">
          <div class="dia-cab">
            <b>{{ d.fecha | date:'d' }}</b>
            <span>{{ d.fecha | date:'EEE' }}</span>
          </div>
          <div class="eventos">
            @for (e of d.eventos; track $index) {
              <a class="evento" [class]="e.tipo" [routerLink]="e.caballoId ? ['/caballos', e.caballoId] : ['/concursos']" [attr.title]="e.titulo + (e.caballo ? ' — ' + e.caballo : '')">
                <strong>{{ e.titulo }}</strong>
                @if (e.caballo) { <span>{{ e.caballo }}</span> }
              </a>
            }
          </div>
        </div>
      }
    </section>
    <p class="leyenda">
      @for (l of leyenda; track l.tipo) { <span><i [class]="l.tipo"></i>{{ l.nombre }}</span> }
    </p>

    <div class="columnas">
      <section class="tarjeta">
        <header><h2>Pendiente de salud</h2></header>
        <ul class="filas">
          @for (a of avisos(); track a.caballoId + a.tipo) {
            <li>
              <mc-avatar [nombre]="a.caballo" [tam]="32" />
              <div class="principal">
                <a [routerLink]="['/caballos', a.caballoId]">{{ TIPOS_SALUD[a.tipo] }} de {{ a.caballo }}</a>
                <span class="tenue pequeno">{{ a.fecha | date:'EEEE d \\'de\\' MMMM' }}</span>
              </div>
              @if (a.fecha < hoyIso) { <span class="etiqueta roja">ATRASADO</span> }
              @else if (dias_(a.fecha) <= 7) { <span class="etiqueta ambar">ESTA SEMANA</span> }
            </li>
          } @empty { <li class="vacio">Todo al día 👌</li> }
        </ul>
      </section>

      <section class="tarjeta">
        <header><h2>Próximos concursos</h2><a routerLink="/concursos">Ver todos</a></header>
        <ul class="filas">
          @for (k of concursos(); track k.id) {
            <li>
              <div class="fecha"><b>{{ k.fechaInicio | date:'d' }}</b><span>{{ k.fechaInicio | date:'MMM' }}</span></div>
              <div class="principal">
                <strong>{{ k.nombre }}</strong>
                <span class="tenue pequeno">{{ nombres(k) || 'Sin caballos apuntados' }}</span>
              </div>
              <span class="tenue pequeno">en {{ dias_(k.fechaInicio) }} días</span>
            </li>
          } @empty { <li class="vacio">Ninguno apuntado</li> }
        </ul>
      </section>
    </div>
  `,
  styles: `
    .gasto-mes { font-weight: 500; }
    .navegacion { display: flex; gap: 6px; }
    .navegacion button { padding: 7px 10px; }
    .calendario { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); overflow: hidden; }
    .dia { min-height: 190px; border-left: 1px solid var(--linea); display: flex; flex-direction: column; }
    .dia:first-child { border-left: 0; }
    .dia-cab { display: grid; justify-items: center; gap: 0; margin: 12px auto 10px; padding: 6px 12px; border-radius: 10px; line-height: 1.15; }
    .dia-cab b { font-size: 17px; }
    .dia-cab span { font-size: 11px; font-weight: 600; color: var(--tenue); text-transform: uppercase; }
    .dia.hoy .dia-cab { background: var(--lateral); color: #fff; }
    .dia.hoy .dia-cab span { color: rgba(255,255,255,.75); }
    .eventos { display: grid; gap: 6px; padding: 0 8px 12px; }
    .evento { display: grid; padding: 6px 9px; border-radius: 8px; font-size: 12.5px; line-height: 1.3; text-decoration: none; overflow: hidden; }
    .evento strong, .evento span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .evento span { opacity: .8; font-size: 12px; }
    .evento:hover { filter: brightness(.96); }
    .SESION { background: var(--sesion-fondo); color: var(--sesion); }
    .SALUD { background: var(--salud-fondo); color: var(--salud); }
    .CONCURSO { background: var(--concurso-fondo); color: var(--concurso); }
    .leyenda { display: flex; flex-wrap: wrap; gap: 6px 18px; margin: 10px 0 28px; font-size: 13px; color: var(--tenue); }
    .leyenda span { display: inline-flex; align-items: center; gap: 6px; }
    .leyenda i { width: 10px; height: 10px; border-radius: 3px; }
    .leyenda i.SESION { background: var(--sesion); }
    .leyenda i.SALUD { background: var(--salud); }
    .leyenda i.CONCURSO { background: var(--concurso); }
    @media (max-width: 820px) {
      .calendario { grid-template-columns: 1fr; }
      .dia { min-height: 0; flex-direction: row; border-left: 0; border-top: 1px solid var(--linea); }
      .dia:first-child { border-top: 0; }
      .dia.sin-eventos { display: none; }
      .dia-cab { margin: 10px; width: 54px; align-self: flex-start; }
      .eventos { flex: 1; padding: 10px 10px 10px 0; }
      .navegacion button { min-height: 36px; }
    }
  `,
})
export class InicioPage {
  private api = inject(Api);

  readonly TIPOS_SALUD = TIPOS_SALUD;
  readonly hoy = new Date();
  readonly hoyIso = hoyIso();
  readonly saludo = this.hoy.getHours() < 14 ? 'Buenos días' : this.hoy.getHours() < 21 ? 'Buenas tardes' : 'Buenas noches';
  readonly leyenda: { tipo: TipoEvento; nombre: string }[] = [
    { tipo: 'SESION', nombre: 'Sesiones' },
    { tipo: 'SALUD', nombre: 'Salud' }, { tipo: 'CONCURSO', nombre: 'Concursos' },
  ];

  /** 0 = semana actual, -1 = anterior, 1 = siguiente */
  semana = signal(0);
  eventos = signal<Evento[]>([]);
  avisos = signal<Aviso[]>([]);
  concursos = signal<Concurso[]>([]);
  gastoMes = signal(0);

  private lunes = computed(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + this.semana() * 7);
    return d;
  });

  dias = computed<Dia[]>(() => Array.from({ length: 7 }, (_, i) => {
    const fecha = new Date(this.lunes());
    fecha.setDate(fecha.getDate() + i);
    const iso = isoDe(fecha);
    return { iso, fecha, eventos: this.eventos().filter(e => e.fecha === iso) };
  }));

  constructor() {
    this.api.avisos().subscribe(a => this.avisos.set(a));
    this.api.concursos().subscribe(k => this.concursos.set(k.slice(0, 4)));
    this.api.gastosDelMes(mesActual()).subscribe(g => this.gastoMes.set(g.reduce((t, x) => t + Number(x.importe), 0)));
    this.cargarSemana();
  }

  nombres(k: Concurso) { return k.caballos.map(c => c.nombre).join(', '); }

  dias_(fecha: string) {
    return Math.round((new Date(fecha + 'T12:00').getTime() - new Date().setHours(12, 0, 0, 0)) / 86_400_000);
  }

  irASemana(n: number) {
    this.semana.set(n);
    this.cargarSemana();
  }

  private cargarSemana() {
    const dias = this.dias();
    this.api.agenda(dias[0].iso, dias[6].iso).subscribe(e => this.eventos.set(e));
  }
}
