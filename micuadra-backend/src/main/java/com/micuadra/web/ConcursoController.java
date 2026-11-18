package com.micuadra.web;

import com.micuadra.domain.Concurso;
import com.micuadra.repo.ConcursoRepository;
import com.micuadra.service.Refs;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/concursos")
public class ConcursoController {

    public record ConcursoRequest(@NotBlank String nombre, String lugar, @NotNull LocalDate fechaInicio,
                                  List<Long> caballoIds) {}

    private final ConcursoRepository concursos;
    private final Refs refs;

    public ConcursoController(ConcursoRepository concursos, Refs refs) {
        this.concursos = concursos;
        this.refs = refs;
    }

    /** Próximos concursos (desde hoy). */
    @GetMapping
    public List<Concurso> listar() {
        return concursos.findByFechaInicioGreaterThanEqualOrderByFechaInicioAsc(LocalDate.now());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Concurso crear(@Valid @RequestBody ConcursoRequest req) {
        var c = new Concurso();
        c.setNombre(req.nombre());
        c.setLugar(req.lugar());
        c.setFechaInicio(req.fechaInicio());
        if (req.caballoIds() != null) req.caballoIds().forEach(id -> c.getCaballos().add(refs.caballo(id)));
        return concursos.save(c);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void borrar(@PathVariable Long id) {
        concursos.deleteById(id);
    }
}
