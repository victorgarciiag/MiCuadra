export type TipoEventoSalud = 'VACUNA_GRIPE' | 'VACUNA_TETANOS' | 'VACUNA_OTRA' | 'DESPARASITACION' | 'HERRADOR' | 'DENTISTA' | 'VETERINARIO';
export type TipoSesion = 'DOMA' | 'SALTO' | 'CUERDA' | 'PASEO' | 'CAMINADOR' | 'SUELTO' | 'CONCURSO' | 'DESCANSO' | 'OTRO';

export interface Caballo {
  id: number; nombre: string; raza?: string; sexo?: string; capa?: string; fechaNacimiento?: string;
  microchip?: string; ueln?: string; licenciaRfhe?: string; foto?: string; notas?: string;
}

export interface EventoSalud { id: number; tipo: TipoEventoSalud; fecha: string; proximaFecha?: string; profesional?: string; coste?: number; notas?: string; }
export interface Sesion { id: number; fecha: string; tipo: TipoSesion; duracionMin?: number; valoracion?: number; notas?: string; }
export type CategoriaGasto = 'PUPILAJE' | 'HERRADOR' | 'VETERINARIO' | 'CLASES' | 'MATERIAL' | 'CONCURSOS' | 'OTRO';
export interface Gasto { id: number; caballo: Caballo; fecha: string; categoria: CategoriaGasto; concepto?: string; importe: number; }
export interface Concurso { id: number; nombre: string; lugar?: string; fechaInicio: string; caballos: Caballo[]; }
export type TipoEvento = 'SESION' | 'SALUD' | 'CONCURSO';
export interface Evento { fecha: string; tipo: TipoEvento; titulo: string; caballo?: string; caballoId?: number; }
export interface Aviso { caballoId: number; caballo: string; tipo: TipoEventoSalud; fecha: string; }

export const CATEGORIAS: Record<CategoriaGasto, string> = {
  PUPILAJE: 'Pupilaje', HERRADOR: 'Herrador', VETERINARIO: 'Veterinario', CLASES: 'Clases',
  MATERIAL: 'Material', CONCURSOS: 'Concursos', OTRO: 'Otros',
};

/** Cómo fue la sesión, de 1 a 5 */
export const VALORACIONES: Record<number, { cara: string; texto: string }> = {
  1: { cara: '😣', texto: 'Mal' }, 2: { cara: '🙁', texto: 'Regular' }, 3: { cara: '😐', texto: 'Normal' },
  4: { cara: '🙂', texto: 'Bien' }, 5: { cara: '😄', texto: 'Genial' },
};

export const TIPOS_SALUD: Record<TipoEventoSalud, string> = {
  VACUNA_GRIPE: 'Vacuna gripe', VACUNA_TETANOS: 'Vacuna tétanos', VACUNA_OTRA: 'Otra vacuna',
  DESPARASITACION: 'Desparasitación', HERRADOR: 'Herrador', DENTISTA: 'Dentista', VETERINARIO: 'Veterinario',
};

export const TIPOS_SESION: Record<TipoSesion, string> = {
  DOMA: 'Doma', SALTO: 'Salto', CUERDA: 'Cuerda', PASEO: 'Paseo', CAMINADOR: 'Caminador',
  SUELTO: 'Suelto', CONCURSO: 'Concurso', DESCANSO: 'Descanso', OTRO: 'Otro',
};

export const keys = <T extends string>(r: Record<T, string>) => Object.keys(r) as T[];
export const hoyIso = () => isoDe(new Date());

export const isoDe = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const mesActual = () => hoyIso().slice(0, 7);
