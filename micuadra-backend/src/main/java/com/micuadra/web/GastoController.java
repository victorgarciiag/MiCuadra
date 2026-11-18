package com.micuadra.web;

import com.micuadra.domain.CategoriaGasto;
import com.micuadra.domain.Gasto;
import com.micuadra.repo.GastoRepository;
import com.micuadra.service.Refs;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api")
public class GastoController {

    public record GastoRequest(LocalDate fecha, @NotNull CategoriaGasto categoria, String concepto,
                               @NotNull @PositiveOrZero BigDecimal importe) {}

    private final GastoRepository gastos;
    private final Refs refs;

    public GastoController(GastoRepository gastos, Refs refs) {
        this.gastos = gastos;
        this.refs = refs;
    }

    /** Gastos de todos los caballos en un mes ("2026-11"); por defecto, el actual. */
    @GetMapping("/gastos")
    public List<Gasto> delMes(@RequestParam(required = false) String mes) {
        YearMonth m = mes == null || mes.isBlank() ? YearMonth.now() : YearMonth.parse(mes);
        return gastos.findByFechaBetweenOrderByFechaDescIdDesc(m.atDay(1), m.atEndOfMonth());
    }

    @GetMapping("/caballos/{caballoId}/gastos")
    public List<Gasto> deCaballo(@PathVariable Long caballoId) {
        return gastos.findByCaballo_IdOrderByFechaDescIdDesc(caballoId);
    }

    @PostMapping("/caballos/{caballoId}/gastos")
    @ResponseStatus(HttpStatus.CREATED)
    public Gasto crear(@PathVariable Long caballoId, @Valid @RequestBody GastoRequest req) {
        var g = new Gasto();
        g.setCaballo(refs.caballo(caballoId));
        g.setFecha(req.fecha() == null ? LocalDate.now() : req.fecha());
        g.setCategoria(req.categoria());
        g.setConcepto(req.concepto());
        g.setImporte(req.importe());
        return gastos.save(g);
    }

    @DeleteMapping("/gastos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void borrar(@PathVariable Long id) {
        gastos.deleteById(id);
    }
}
