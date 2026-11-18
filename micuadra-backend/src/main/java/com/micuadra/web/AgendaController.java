package com.micuadra.web;

import com.micuadra.domain.TipoEventoSalud;
import com.micuadra.domain.TipoSesion;
import com.micuadra.repo.ConcursoRepository;
import com.micuadra.repo.EventoSaludRepository;
import com.micuadra.repo.SesionRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/** Todo lo que pasa entre dos fechas, para el calendario semanal del inicio. */
@RestController
public class AgendaController {

    public enum TipoEvento { SESION, SALUD, CONCURSO }

    public record Evento(LocalDate fecha, TipoEvento tipo, String titulo, String caballo, Long caballoId) {}

    private final SesionRepository sesiones;
    private final EventoSaludRepository salud;
    private final ConcursoRepository concursos;

    public AgendaController(SesionRepository sesiones, EventoSaludRepository salud, ConcursoRepository concursos) {
        this.sesiones = sesiones;
        this.salud = salud;
        this.concursos = concursos;
    }

    @GetMapping("/api/agenda")
    @Transactional(readOnly = true)
    public List<Evento> agenda(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
                               @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        List<Evento> eventos = new ArrayList<>();
        sesiones.findByFechaBetween(desde, hasta).stream()
                .filter(s -> s.getTipo() != TipoSesion.DESCANSO)
                .forEach(s -> eventos.add(new Evento(s.getFecha(), TipoEvento.SESION, nombre(s.getTipo()),
                        s.getCaballo().getNombre(), s.getCaballo().getId())));
        salud.findByProximaFechaBetween(desde, hasta)
                .forEach(e -> eventos.add(new Evento(e.getProximaFecha(), TipoEvento.SALUD, nombre(e.getTipo()),
                        e.getCaballo().getNombre(), e.getCaballo().getId())));
        concursos.findByFechaInicioBetween(desde, hasta)
                .forEach(k -> eventos.add(new Evento(k.getFechaInicio(), TipoEvento.CONCURSO, k.getNombre(),
                        k.getCaballos().stream().map(c -> c.getNombre()).sorted().collect(Collectors.joining(", ")), null)));
        eventos.sort(Comparator.comparing(Evento::fecha).thenComparing(Evento::tipo));
        return eventos;
    }

    private static String nombre(TipoSesion t) {
        return switch (t) {
            case DOMA -> "Doma";
            case SALTO -> "Salto";
            case CUERDA -> "Cuerda";
            case PASEO -> "Paseo";
            case CAMINADOR -> "Caminador";
            case SUELTO -> "Suelto";
            case CONCURSO -> "Concurso";
            case DESCANSO -> "Descanso";
            case OTRO -> "Sesión";
        };
    }

    private static String nombre(TipoEventoSalud t) {
        return switch (t) {
            case VACUNA_GRIPE -> "Vacuna gripe";
            case VACUNA_TETANOS -> "Vacuna tétanos";
            case VACUNA_OTRA -> "Vacuna";
            case DESPARASITACION -> "Desparasitación";
            case HERRADOR -> "Herrador";
            case DENTISTA -> "Dentista";
            case VETERINARIO -> "Veterinario";
        };
    }
}
