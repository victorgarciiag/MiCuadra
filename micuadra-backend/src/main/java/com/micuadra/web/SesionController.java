package com.micuadra.web;

import com.micuadra.domain.Sesion;
import com.micuadra.domain.TipoSesion;
import com.micuadra.repo.SesionRepository;
import com.micuadra.service.Refs;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
public class SesionController {

    public record SesionRequest(LocalDate fecha, @NotNull TipoSesion tipo, Integer duracionMin,
                                @Min(1) @Max(5) Integer valoracion, String notas) {}

    private final SesionRepository sesiones;
    private final Refs refs;

    public SesionController(SesionRepository sesiones, Refs refs) {
        this.sesiones = sesiones;
        this.refs = refs;
    }

    @GetMapping("/caballos/{caballoId}/sesiones")
    public List<Sesion> listar(@PathVariable Long caballoId) {
        return sesiones.findByCaballo_IdOrderByFechaDescIdDesc(caballoId);
    }

    @PostMapping("/caballos/{caballoId}/sesiones")
    @ResponseStatus(HttpStatus.CREATED)
    public Sesion crear(@PathVariable Long caballoId, @Valid @RequestBody SesionRequest req) {
        var s = new Sesion();
        s.setCaballo(refs.caballo(caballoId));
        s.setFecha(req.fecha() == null ? LocalDate.now() : req.fecha());
        s.setTipo(req.tipo());
        s.setDuracionMin(req.duracionMin());
        s.setValoracion(req.valoracion());
        s.setNotas(req.notas());
        return sesiones.save(s);
    }

    @DeleteMapping("/sesiones/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void borrar(@PathVariable Long id) {
        sesiones.deleteById(id);
    }
}
