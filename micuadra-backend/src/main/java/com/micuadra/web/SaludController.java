package com.micuadra.web;

import com.micuadra.domain.EventoSalud;
import com.micuadra.domain.TipoEventoSalud;
import com.micuadra.repo.EventoSaludRepository;
import com.micuadra.service.Refs;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class SaludController {

    public record EventoSaludRequest(@NotNull TipoEventoSalud tipo, @NotNull LocalDate fecha, LocalDate proximaFecha,
                                     String profesional, BigDecimal coste, String notas) {}

    public record Aviso(Long caballoId, String caballo, TipoEventoSalud tipo, LocalDate fecha) {}

    private final EventoSaludRepository eventos;
    private final Refs refs;

    public SaludController(EventoSaludRepository eventos, Refs refs) {
        this.eventos = eventos;
        this.refs = refs;
    }

    @GetMapping("/caballos/{caballoId}/salud")
    public List<EventoSalud> listar(@PathVariable Long caballoId) {
        return eventos.findByCaballo_IdOrderByFechaDesc(caballoId);
    }

    /** Lo que toca en los próximos 30 días (o ya se pasó): solo el registro más reciente de cada tipo y caballo. */
    @GetMapping("/avisos")
    @Transactional(readOnly = true)
    public List<Aviso> avisos() {
        LocalDate limite = LocalDate.now().plusDays(30);
        Map<String, EventoSalud> ultimos = eventos.findByProximaFechaIsNotNull().stream()
                .collect(Collectors.toMap(e -> e.getCaballo().getId() + "|" + e.getTipo(), e -> e,
                        (a, b) -> a.getFecha().isAfter(b.getFecha()) ? a : b));
        return ultimos.values().stream()
                .filter(e -> !e.getProximaFecha().isAfter(limite))
                .map(e -> new Aviso(e.getCaballo().getId(), e.getCaballo().getNombre(), e.getTipo(), e.getProximaFecha()))
                .sorted(Comparator.comparing(Aviso::fecha))
                .toList();
    }

    @PostMapping("/caballos/{caballoId}/salud")
    @ResponseStatus(HttpStatus.CREATED)
    public EventoSalud crear(@PathVariable Long caballoId, @Valid @RequestBody EventoSaludRequest req) {
        var e = new EventoSalud();
        e.setCaballo(refs.caballo(caballoId));
        e.setTipo(req.tipo());
        e.setFecha(req.fecha());
        e.setProximaFecha(req.proximaFecha() != null ? req.proximaFecha() : proximaPorDefecto(req.tipo(), req.fecha()));
        e.setProfesional(req.profesional());
        e.setCoste(req.coste());
        e.setNotas(req.notas());
        return eventos.save(e);
    }

    @DeleteMapping("/salud/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void borrar(@PathVariable Long id) {
        eventos.deleteById(id);
    }

    /** Sugerencia para que registrar sea rápido; el usuario puede indicar otra. */
    private static LocalDate proximaPorDefecto(TipoEventoSalud tipo, LocalDate fecha) {
        return switch (tipo) {
            case VACUNA_GRIPE -> fecha.plusMonths(6);
            case VACUNA_TETANOS, DENTISTA, VACUNA_OTRA -> fecha.plusYears(1);
            case DESPARASITACION -> fecha.plusMonths(3);
            case HERRADOR -> fecha.plusWeeks(6);
            case VETERINARIO -> null;
        };
    }
}
