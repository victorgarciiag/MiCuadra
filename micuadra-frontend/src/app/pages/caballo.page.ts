import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../api.service';
import { Avatar } from '../ui/avatar.component';
import { Icono } from '../ui/icono.component';
import { reducirFoto } from '../ui/foto';
import {
  CATEGORIAS, Caballo, CategoriaGasto, EventoSalud, Gasto, Sesion, TIPOS_SALUD, TIPOS_SESION, TipoEventoSalud, TipoSesion,
  VALORACIONES, hoyIso, keys, mesActual,
} from '../models';

type Pestana = 'diario' | 'salud' | 'gastos' | 'ficha';

@Component({
  selector: 'app-caballo',
  imports: [FormsModule, DatePipe, CurrencyPipe, Avatar, Icono],
  template: `
    @if (caballo(); as c) {
      <div class="cabecera">
        <div class="identidad">
          <label class="foto" title="Cambiar foto">
            <mc-avatar [nombre]="c.nombre" [foto]="c.foto" [tam]="72" />
            <span class="cambiar"><mc-icono nombre="camara" /></span>
            <input type="file" accept="image/*" (change)="cambiarFoto($event)" hidden>
          </label>
          <div>
            <h1>{{ c.nombre }}</h1>
            <p>{{ descripcion() }}</p>
          </div>
        </div>
        <div class="resumen">
          <div><b>{{ sesionesMes() }}</b><span>sesiones este mes</span></div>
          <div><b>{{ gastoMes() | currency:'EUR':'symbol':'1.0-0' }}</b><span>gastado este mes</span></div>
        </div>
      </div>

      <div class="pestanas" role="tablist">
        @for (p of pestanas; track p.id) {
          <button role="tab" [class.activo]="pestana() === p.id" (click)="pestana.set(p.id)">{{ p.nombre }}</button>
        }
      </div>

      @switch (pestana()) {
        @case ('diario') {
          <div class="columnas formulario-lado">
            <section class="tarjeta">
              <ul class="filas">
                @for (s of sesiones(); track s.id) {
                  <li>
                    <div class="fecha"><b>{{ s.fecha | date:'d' }}</b><span>{{ s.fecha | date:'MMM' }}</span></div>
                    <div class="principal">
                      <strong>{{ TIPOS_SESION[s.tipo] }}@if (s.duracionMin) {<span class="tenue">, {{ s.duracionMin }} min</span>}</strong>
                      @if (s.notas) { <span class="tenue pequeno">{{ s.notas }}</span> }
                    </div>
                    @if (s.valoracion) { <span class="cara" [title]="VALORACIONES[s.valoracion].texto">{{ VALORACIONES[s.valoracion].cara }}</span> }
                    <button class="quitar" (click)="borrarSesion(s.id)" aria-label="Borrar sesión">✕</button>
                  </li>
                } @empty { <li class="vacio">Aún no hay sesiones. Apunta la de hoy 👉</li> }
              </ul>
            </section>

            <section class="tarjeta">
              <header><h2>Apuntar sesión</h2></header>
              <div class="formulario">
                <div class="chips">
                  @for (t of tiposSesion; track t) {
                    <button type="button" [class.activo]="sesion.tipo === t" (click)="sesion.tipo = t">{{ TIPOS_SESION[t] }}</button>
                  }
                </div>
                @if (sesion.tipo !== 'DESCANSO') {
                  <div class="chips">
                    @for (m of [20, 30, 45, 60]; track m) {
                      <button type="button" [class.activo]="sesion.duracionMin === m" (click)="sesion.duracionMin = m">{{ m }} min</button>
                    }
                  </div>
                  <div>
                    <span class="pequeno tenue">¿Cómo fue?</span>
                    <div class="caras">
                      @for (v of [1, 2, 3, 4, 5]; track v) {
                        <button type="button" [class.activo]="sesion.valoracion === v" (click)="sesion.valoracion = v"
                                [attr.aria-label]="VALORACIONES[v].texto" [title]="VALORACIONES[v].texto">{{ VALORACIONES[v].cara }}</button>
                      }
                    </div>
                  </div>
                }
                <label>Notas<textarea rows="2" [(ngModel)]="sesion.notas" placeholder="Opcional"></textarea></label>
                <label>Fecha<input type="date" [(ngModel)]="sesion.fecha"></label>
                <button (click)="guardarSesion()">Guardar sesión</button>
              </div>
            </section>
          </div>
        }

        @case ('salud') {
          <div class="columnas formulario-lado">
            <section class="tarjeta">
              <ul class="filas">
                @for (e of eventos(); track e.id) {
                  <li>
                    <div class="fecha"><b>{{ e.fecha | date:'d' }}</b><span>{{ e.fecha | date:'MMM yy' }}</span></div>
                    <div class="principal">
                      <strong>{{ TIPOS_SALUD[e.tipo] }}</strong>
                      <span class="tenue pequeno">{{ e.notas || (e.coste ? (e.coste | currency:'EUR') : '') }}</span>
                    </div>
                    @if (e.proximaFecha) {
                      <span class="etiqueta" [class.roja]="e.proximaFecha < hoy" [class.ambar]="e.proximaFecha >= hoy">PRÓXIMA {{ e.proximaFecha | date:'d MMM' }}</span>
                    }
                    <button class="quitar" (click)="borrarSalud(e.id)" aria-label="Borrar registro">✕</button>
                  </li>
                } @empty { <li class="vacio">Sin registros de salud</li> }
              </ul>
            </section>
            <section class="tarjeta">
              <header><h2>Apuntar cuidado</h2></header>
              <form class="formulario" (ngSubmit)="guardarSalud()">
                <label>Qué se hizo
                  <select name="tipo" [(ngModel)]="salud.tipo">
                    @for (t of tiposSalud; track t) { <option [ngValue]="t">{{ TIPOS_SALUD[t] }}</option> }
                  </select>
                </label>
                <div class="dos">
                  <label>Fecha<input type="date" name="fecha" [(ngModel)]="salud.fecha"></label>
                  <label>Coste €<input type="number" name="coste" min="0" [(ngModel)]="salud.coste"></label>
                </div>
                <label>Próxima vez<input type="date" name="proxima" [(ngModel)]="salud.proximaFecha"><span class="pequeno">Si la dejas vacía se calcula sola.</span></label>
                <label>Notas<input name="notas" [(ngModel)]="salud.notas"></label>
                <button>Guardar</button>
              </form>
            </section>
          </div>
        }

        @case ('gastos') {
          <div class="columnas formulario-lado">
            <section class="tarjeta">
              <ul class="filas">
                @for (g of gastos(); track g.id) {
                  <li>
                    <div class="fecha"><b>{{ g.fecha | date:'d' }}</b><span>{{ g.fecha | date:'MMM' }}</span></div>
                    <div class="principal">
                      <strong>{{ g.concepto || CATEGORIAS[g.categoria] }}</strong>
                      <span class="tenue pequeno">{{ CATEGORIAS[g.categoria] }}</span>
                    </div>
                    <strong>{{ g.importe | currency:'EUR' }}</strong>
                    <button class="quitar" (click)="borrarGasto(g.id)" aria-label="Borrar gasto">✕</button>
                  </li>
                } @empty { <li class="vacio">Sin gastos apuntados</li> }
              </ul>
            </section>
            <section class="tarjeta">
              <header><h2>Apuntar gasto</h2></header>
              <form class="formulario" (ngSubmit)="guardarGasto()">
                <div class="chips">
                  @for (k of categorias; track k) {
                    <button type="button" [class.activo]="gasto.categoria === k" (click)="gasto.categoria = k">{{ CATEGORIAS[k] }}</button>
                  }
                </div>
                <div class="dos">
                  <label>Importe €<input type="number" name="importe" min="0" [(ngModel)]="gasto.importe"></label>
                  <label>Fecha<input type="date" name="fecha" [(ngModel)]="gasto.fecha"></label>
                </div>
                <label>Concepto<input name="concepto" [(ngModel)]="gasto.concepto" placeholder="Opcional"></label>
                <button [disabled]="gasto.importe == null">Guardar gasto</button>
              </form>
            </section>
          </div>
        }

        @case ('ficha') {
          <section class="tarjeta">
            <form class="formulario ficha" (ngSubmit)="guardarFicha()">
              <label>Nombre<input name="nombre" [(ngModel)]="ficha.nombre"></label>
              <label>Raza<input name="raza" [(ngModel)]="ficha.raza"></label>
              <label>Sexo<input name="sexo" [(ngModel)]="ficha.sexo"></label>
              <label>Capa<input name="capa" [(ngModel)]="ficha.capa"></label>
              <label>Nacimiento<input type="date" name="nac" [(ngModel)]="ficha.fechaNacimiento"></label>
              <label>Microchip<input name="microchip" [(ngModel)]="ficha.microchip"></label>
              <label>UELN<input name="ueln" [(ngModel)]="ficha.ueln"></label>
              <label>Licencia RFHE<input name="licencia" [(ngModel)]="ficha.licenciaRfhe"></label>
              <label class="ancho">Notas<textarea name="notas" rows="3" [(ngModel)]="ficha.notas"></textarea></label>
              <div class="acciones ancho">
                <button>Guardar cambios</button>
                @if (guardado()) { <span class="tenue">Guardado ✓</span> }
                <button type="button" class="quitar" (click)="borrarCaballo()">Eliminar caballo</button>
              </div>
            </form>
          </section>
        }
      }
    }
  `,
  styles: `
    .cabecera { align-items: center; }
    .identidad { display: flex; align-items: center; gap: 18px; }
    .foto { position: relative; cursor: pointer; }
    .cambiar { position: absolute; right: -6px; bottom: -6px; display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: var(--papel); border: 1px solid var(--linea); color: var(--texto); }
    .resumen { display: flex; gap: 12px; }
    .resumen div { display: grid; padding: 10px 16px; border-radius: 12px; background: var(--papel); border: 1px solid var(--linea); }
    .resumen b { font-size: 20px; }
    .resumen span { font-size: 12px; color: var(--tenue); }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .chips button { background: var(--papel); color: var(--texto-2); border: 1px solid var(--linea); padding: 7px 12px; font-weight: 500; }
    .chips button:hover { background: var(--fondo); }
    .chips button.activo { background: var(--acento); color: #fff; border-color: var(--acento); }
    .caras { display: flex; gap: 6px; margin-top: 6px; }
    .caras button { background: var(--fondo); font-size: 22px; padding: 6px 10px; filter: grayscale(1); opacity: .6; }
    .caras button:hover { background: var(--acento-suave); filter: none; opacity: 1; }
    .caras button.activo { background: var(--acento-suave); filter: none; opacity: 1; box-shadow: inset 0 0 0 2px var(--acento); }
    .cara { font-size: 20px; }
    @media (max-width: 820px) {
      .resumen div { flex: 1; }
      .caras { justify-content: space-between; }
      .caras button { flex: 1; }
      .chips button { min-height: 40px; }
    }
    .ficha { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
    .ficha .ancho { grid-column: 1 / -1; }
    .acciones { display: flex; align-items: center; gap: 12px; }
    .acciones .quitar { margin-left: auto; }
  `,
})
export class CaballoPage implements OnInit {
  id = input.required<string>();

  private api = inject(Api);
  private router = inject(Router);

  readonly TIPOS_SESION = TIPOS_SESION;
  readonly TIPOS_SALUD = TIPOS_SALUD;
  readonly CATEGORIAS = CATEGORIAS;
  readonly VALORACIONES = VALORACIONES;
  readonly tiposSesion = keys(TIPOS_SESION).filter(t => t !== 'CONCURSO' && t !== 'OTRO');
  readonly tiposSalud = keys(TIPOS_SALUD);
  readonly categorias = keys(CATEGORIAS);
  readonly hoy = hoyIso();
  readonly pestanas: { id: Pestana; nombre: string }[] = [
    { id: 'diario', nombre: 'Diario' }, { id: 'salud', nombre: 'Salud' },
    { id: 'gastos', nombre: 'Gastos' }, { id: 'ficha', nombre: 'Ficha' },
  ];

  caballo = signal<Caballo | null>(null);
  sesiones = signal<Sesion[]>([]);
  eventos = signal<EventoSalud[]>([]);
  gastos = signal<Gasto[]>([]);
  pestana = signal<Pestana>('diario');
  guardado = signal(false);

  descripcion = computed(() => {
    const c = this.caballo();
    if (!c) return '';
    const edad = c.fechaNacimiento ? `${new Date().getFullYear() - Number(c.fechaNacimiento.slice(0, 4))} años` : null;
    return [c.raza, c.sexo, c.capa, edad].filter(Boolean).join(', ') || 'Completa sus datos en la ficha';
  });
  sesionesMes = computed(() => this.sesiones().filter(s => s.fecha.startsWith(mesActual()) && s.tipo !== 'DESCANSO').length);
  gastoMes = computed(() => this.gastos().filter(g => g.fecha.startsWith(mesActual())).reduce((t, g) => t + Number(g.importe), 0));

  ficha: Partial<Omit<Caballo, 'id'>> = {};
  sesion = this.sesionVacia();
  salud = this.saludVacia();
  gasto = this.gastoVacio();

  private get caballoId() { return Number(this.id()); }

  ngOnInit() {
    this.api.caballo(this.caballoId).subscribe(c => {
      this.caballo.set(c);
      const { id: _id, ...resto } = c;
      this.ficha = resto;
    });
    this.cargarSesiones();
    this.cargarSalud();
    this.cargarGastos();
  }

  async cambiarFoto(evento: Event) {
    const archivo = (evento.target as HTMLInputElement).files?.[0];
    if (!archivo) return;
    this.ficha.foto = await reducirFoto(archivo);
    this.guardarFicha();
  }

  guardarSesion() {
    const datos = this.sesion.tipo === 'DESCANSO' ? { ...this.sesion, duracionMin: null, valoracion: null } : this.sesion;
    this.api.crearSesion(this.caballoId, datos).subscribe(() => {
      this.sesion = this.sesionVacia();
      this.cargarSesiones();
    });
  }

  borrarSesion(id: number) { this.api.borrarSesion(id).subscribe(() => this.cargarSesiones()); }

  guardarSalud() {
    this.api.crearSalud(this.caballoId, { ...this.salud, proximaFecha: this.salud.proximaFecha || null }).subscribe(() => {
      this.salud = this.saludVacia();
      this.cargarSalud();
    });
  }

  borrarSalud(id: number) { this.api.borrarSalud(id).subscribe(() => this.cargarSalud()); }

  guardarGasto() {
    this.api.crearGasto(this.caballoId, this.gasto).subscribe(() => {
      this.gasto = { ...this.gastoVacio(), categoria: this.gasto.categoria };
      this.cargarGastos();
    });
  }

  borrarGasto(id: number) { this.api.borrarGasto(id).subscribe(() => this.cargarGastos()); }

  guardarFicha() {
    this.api.actualizarCaballo(this.caballoId, this.ficha).subscribe(c => {
      this.caballo.set(c);
      this.guardado.set(true);
      setTimeout(() => this.guardado.set(false), 2000);
    });
  }

  borrarCaballo() {
    if (confirm('¿Eliminar este caballo y todo su historial?')) {
      this.api.borrarCaballo(this.caballoId).subscribe(() => this.router.navigate(['/caballos']));
    }
  }

  private cargarSesiones() { this.api.sesiones(this.caballoId).subscribe(s => this.sesiones.set(s)); }
  private cargarSalud() { this.api.salud(this.caballoId).subscribe(e => this.eventos.set(e)); }
  private cargarGastos() { this.api.gastos(this.caballoId).subscribe(g => this.gastos.set(g)); }

  private sesionVacia() {
    return { fecha: hoyIso(), tipo: 'DOMA' as TipoSesion, duracionMin: 45 as number | null, valoracion: null as number | null, notas: '' };
  }

  private saludVacia() {
    return { tipo: 'VACUNA_GRIPE' as TipoEventoSalud, fecha: hoyIso(), proximaFecha: '', coste: null as number | null, notas: '' };
  }

  private gastoVacio() {
    return { categoria: 'PUPILAJE' as CategoriaGasto, importe: null as number | null, fecha: hoyIso(), concepto: '' };
  }
}
