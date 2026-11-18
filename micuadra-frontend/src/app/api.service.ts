import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Aviso, Caballo, Concurso, Evento, EventoSalud, Gasto, Sesion } from './models';

@Injectable({ providedIn: 'root' })
export class Api {
  private http = inject(HttpClient);
  private base = '/api';

  agenda(desde: string, hasta: string) { return this.http.get<Evento[]>(`${this.base}/agenda`, { params: { desde, hasta } }); }
  avisos() { return this.http.get<Aviso[]>(`${this.base}/avisos`); }

  caballos() { return this.http.get<Caballo[]>(`${this.base}/caballos`); }
  caballo(id: number) { return this.http.get<Caballo>(`${this.base}/caballos/${id}`); }
  crearCaballo(c: object) { return this.http.post<Caballo>(`${this.base}/caballos`, c); }
  actualizarCaballo(id: number, c: object) { return this.http.put<Caballo>(`${this.base}/caballos/${id}`, c); }
  borrarCaballo(id: number) { return this.http.delete<void>(`${this.base}/caballos/${id}`); }

  sesiones(caballoId: number) { return this.http.get<Sesion[]>(`${this.base}/caballos/${caballoId}/sesiones`); }
  crearSesion(caballoId: number, s: object) { return this.http.post<Sesion>(`${this.base}/caballos/${caballoId}/sesiones`, s); }
  borrarSesion(id: number) { return this.http.delete<void>(`${this.base}/sesiones/${id}`); }

  salud(caballoId: number) { return this.http.get<EventoSalud[]>(`${this.base}/caballos/${caballoId}/salud`); }
  crearSalud(caballoId: number, e: object) { return this.http.post<EventoSalud>(`${this.base}/caballos/${caballoId}/salud`, e); }
  borrarSalud(id: number) { return this.http.delete<void>(`${this.base}/salud/${id}`); }

  gastosDelMes(mes: string) { return this.http.get<Gasto[]>(`${this.base}/gastos`, { params: { mes } }); }
  gastos(caballoId: number) { return this.http.get<Gasto[]>(`${this.base}/caballos/${caballoId}/gastos`); }
  crearGasto(caballoId: number, g: object) { return this.http.post<Gasto>(`${this.base}/caballos/${caballoId}/gastos`, g); }
  borrarGasto(id: number) { return this.http.delete<void>(`${this.base}/gastos/${id}`); }

  concursos() { return this.http.get<Concurso[]>(`${this.base}/concursos`); }
  crearConcurso(c: object) { return this.http.post<Concurso>(`${this.base}/concursos`, c); }
  borrarConcurso(id: number) { return this.http.delete<void>(`${this.base}/concursos/${id}`); }
}
