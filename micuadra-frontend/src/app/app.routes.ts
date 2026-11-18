import { Routes } from '@angular/router';
import { InicioPage } from './pages/inicio.page';
import { CaballosPage } from './pages/caballos.page';
import { CaballoPage } from './pages/caballo.page';
import { ConcursosPage } from './pages/concursos.page';
import { GastosPage } from './pages/gastos.page';

export const routes: Routes = [
  { path: '', component: InicioPage, title: 'MiCuadra' },
  { path: 'caballos', component: CaballosPage, title: 'Caballos · MiCuadra' },
  { path: 'caballos/:id', component: CaballoPage, title: 'Caballo · MiCuadra' },
  { path: 'concursos', component: ConcursosPage, title: 'Concursos · MiCuadra' },
  { path: 'gastos', component: GastosPage, title: 'Gastos · MiCuadra' },
  { path: '**', redirectTo: '' },
];
