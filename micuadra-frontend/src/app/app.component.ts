import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Api } from './api.service';
import { Caballo } from './models';
import { Avatar } from './ui/avatar.component';
import { Icono } from './ui/icono.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule, Avatar, Icono],
  template: `
    <aside>
      <a routerLink="/" class="marca">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h18M3 13h18M5 6v13M19 6v13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        MiCuadra
      </a>

      <nav>
        @for (e of enlaces; track e.ruta) {
          <a [routerLink]="e.ruta" routerLinkActive="activo" [routerLinkActiveOptions]="{ exact: true }">
            <mc-icono [nombre]="e.icono" /> {{ e.nombre }}
            @if (e.ruta === '/' && pendientes()) { <span class="globo">{{ pendientes() }}</span> }
          </a>
        }
      </nav>

      <div class="grupo">
        <p>Mis caballos</p>
        @for (c of caballos(); track c.id) {
          <a [routerLink]="['/caballos', c.id]" routerLinkActive="activo">
            <mc-avatar [nombre]="c.nombre" [foto]="c.foto" [tam]="22" /> {{ c.nombre }}
          </a>
        }
      </div>
    </aside>

    <div class="contenido">
      <header class="barra">
        <a routerLink="/" class="marca-movil">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h18M3 13h18M5 6v13M19 6v13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          MiCuadra
        </a>
        <label class="buscador">
          <mc-icono nombre="buscar" />
          <input type="search" placeholder="Buscar caballo…" [(ngModel)]="busqueda" (keydown.enter)="buscar()" list="caballos-lista" aria-label="Buscar caballo">
          <datalist id="caballos-lista">
            @for (c of caballos(); track c.id) { <option [value]="c.nombre"></option> }
          </datalist>
        </label>
        <a routerLink="/" class="campana" [attr.aria-label]="pendientes() + ' cuidados pendientes'">
          <mc-icono nombre="campana" />
          @if (pendientes()) { <span class="globo">{{ pendientes() }}</span> }
        </a>
      </header>
      <main><router-outlet /></main>
    </div>

    <nav class="inferior" aria-label="Navegación principal">
      @for (e of enlaces; track e.ruta) {
        <a [routerLink]="e.ruta" routerLinkActive="activo" [routerLinkActiveOptions]="{ exact: e.ruta === '/' }">
          <span class="icono"><mc-icono [nombre]="e.icono" />
            @if (e.ruta === '/' && pendientes()) { <span class="punto"></span> }
          </span>
          {{ e.nombre }}
        </a>
      }
    </nav>
  `,
  styles: `
    :host { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }
    aside {
      position: sticky; top: 0; height: 100vh; overflow-y: auto;
      display: flex; flex-direction: column; gap: 28px; padding: 22px 14px;
      background: var(--lateral); color: #fff;
    }
    .marca { display: flex; align-items: center; gap: 10px; padding: 0 10px; color: #fff; text-decoration: none; font-weight: 800; font-size: 18px; letter-spacing: -.02em; }
    .marca svg { width: 24px; height: 24px; }
    nav, .grupo { display: flex; flex-direction: column; gap: 2px; }
    nav a, .grupo a {
      display: flex; align-items: center; gap: 12px; padding: 9px 12px; border-radius: 10px;
      color: rgba(255,255,255,.82); text-decoration: none; font-weight: 500;
    }
    nav a:hover, .grupo a:hover { background: var(--lateral-hover); color: #fff; }
    nav a.activo, .grupo a.activo { background: var(--lateral-activo); color: #fff; font-weight: 600; }
    .grupo { padding-top: 20px; border-top: 1px solid rgba(255,255,255,.1); }
    .grupo p { margin: 0 0 6px; padding: 0 12px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,.5); }
    .globo { margin-left: auto; min-width: 22px; padding: 1px 7px; border-radius: 999px; background: #E5484D; color: #fff; font-size: 12px; font-weight: 700; text-align: center; }

    .contenido { min-width: 0; display: flex; flex-direction: column; }
    .barra { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px clamp(16px, 3vw, 40px); background: var(--papel); border-bottom: 1px solid var(--linea); }
    .buscador { flex-direction: row; align-items: center; gap: 8px; width: min(360px, 100%); padding: 0 12px; border-radius: 12px; background: var(--fondo); color: var(--tenue); }
    .buscador input { flex: 1; border: 0; background: none; padding: 10px 0; box-shadow: none; }
    .campana { position: relative; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; color: var(--texto); }
    .campana:hover { background: var(--fondo); }
    .campana .globo { position: absolute; top: 2px; right: -2px; min-width: 18px; padding: 0 5px; font-size: 11px; }
    main { padding: 32px clamp(16px, 3vw, 40px) 64px; max-width: 1200px; width: 100%; }

    .marca-movil, .inferior { display: none; }

    /* Móvil: menú lateral fuera, barra superior compacta y pestañas abajo */
    @media (max-width: 820px) {
      :host { display: block; }
      aside { display: none; }
      .barra {
        position: sticky; top: 0; z-index: 20;
        padding: 10px 16px; padding-top: max(10px, env(safe-area-inset-top));
        background: var(--lateral); border-bottom: 0; color: #fff;
      }
      .marca-movil { display: flex; align-items: center; gap: 8px; color: #fff; text-decoration: none; font-weight: 800; font-size: 18px; letter-spacing: -.02em; }
      .marca-movil svg { width: 22px; height: 22px; }
      .buscador { display: none; }
      .campana { color: #fff; }
      .campana:hover { background: rgba(255,255,255,.1); }
      main { padding: 20px 16px calc(84px + env(safe-area-inset-bottom)); }

      .inferior {
        position: fixed; inset: auto 0 0 0; z-index: 20;
        display: grid; grid-template-columns: repeat(4, 1fr);
        padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
        background: var(--papel); border-top: 1px solid var(--linea);
      }
      .inferior a {
        display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 0;
        color: var(--tenue); text-decoration: none; font-size: 11px; font-weight: 600;
      }
      .inferior .icono { position: relative; display: grid; place-items: center; width: 52px; height: 30px; border-radius: 999px; }
      .inferior a.activo { color: var(--acento); }
      .inferior a.activo .icono { background: var(--acento-suave); }
      .punto { position: absolute; top: 3px; right: 12px; width: 8px; height: 8px; border-radius: 50%; background: #E5484D; }
    }
  `,
})
export class AppComponent {
  private api = inject(Api);
  private router = inject(Router);

  readonly enlaces = [
    { ruta: '/', nombre: 'Inicio', icono: 'inicio' },
    { ruta: '/caballos', nombre: 'Caballos', icono: 'caballos' },
    { ruta: '/concursos', nombre: 'Concursos', icono: 'concursos' },
    { ruta: '/gastos', nombre: 'Gastos', icono: 'gastos' },
  ];
  caballos = signal<Caballo[]>([]);
  private avisos = signal(0);
  pendientes = computed(() => this.avisos());
  busqueda = '';

  constructor() {
    // Se refresca al navegar para reflejar caballos nuevos o cuidados recién apuntados
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.api.caballos().subscribe(c => this.caballos.set(c));
      this.api.avisos().subscribe(a => this.avisos.set(a.length));
    });
  }

  buscar() {
    const texto = this.busqueda.trim().toLowerCase();
    const caballo = this.caballos().find(c => c.nombre.toLowerCase().includes(texto));
    if (texto && caballo) {
      this.busqueda = '';
      this.router.navigate(['/caballos', caballo.id]);
    }
  }
}
