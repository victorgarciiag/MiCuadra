package com.micuadra;

import com.micuadra.domain.*;
import com.micuadra.repo.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Unos pocos datos de prueba si la base de datos está vacía. */
@Component
@ConditionalOnProperty(name = "micuadra.datos-demo", havingValue = "true")
public class DatosDemo implements CommandLineRunner {

    private final CaballoRepository caballos;
    private final EventoSaludRepository eventos;
    private final SesionRepository sesiones;
    private final GastoRepository gastos;
    private final ConcursoRepository concursos;

    public DatosDemo(CaballoRepository caballos, EventoSaludRepository eventos, SesionRepository sesiones,
                     GastoRepository gastos, ConcursoRepository concursos) {
        this.caballos = caballos;
        this.eventos = eventos;
        this.sesiones = sesiones;
        this.gastos = gastos;
        this.concursos = concursos;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (caballos.count() > 0) return;
        LocalDate hoy = LocalDate.now();

        Caballo quijote = caballo("Quijote", "PRE", "Macho castrado", "Tordo");
        Caballo bruma = caballo("Bruma", "Silla Español", "Yegua", "Castaña");

        salud(quijote, TipoEventoSalud.VACUNA_GRIPE, hoy.minusMonths(5), hoy.plusDays(20), null);
        salud(bruma, TipoEventoSalud.HERRADOR, hoy.minusWeeks(5), hoy.plusDays(7), "90");

        sesion(quijote, hoy.minusDays(1), TipoSesion.SALTO, 45, 5, "Muy atento en las combinaciones");
        sesion(bruma, hoy.minusDays(2), TipoSesion.DOMA, 40, 3, "Algo rígida del lado izquierdo");

        gasto(quijote, hoy.withDayOfMonth(1), CategoriaGasto.PUPILAJE, "Pupilaje", "450");
        gasto(bruma, hoy.withDayOfMonth(1), CategoriaGasto.PUPILAJE, "Pupilaje", "450");
        gasto(quijote, hoy.minusDays(1), CategoriaGasto.CLASES, "Clase de salto", "35");

        var concurso = new Concurso();
        concurso.setNombre("CSN 2* Sevilla");
        concurso.setLugar("Sevilla");
        concurso.setFechaInicio(hoy.plusDays(12));
        concurso.getCaballos().add(quijote);
        concursos.save(concurso);
    }

    private Caballo caballo(String nombre, String raza, String sexo, String capa) {
        var c = new Caballo();
        c.setNombre(nombre);
        c.setRaza(raza);
        c.setSexo(sexo);
        c.setCapa(capa);
        return caballos.save(c);
    }

    private void salud(Caballo c, TipoEventoSalud tipo, LocalDate fecha, LocalDate proxima, String coste) {
        var e = new EventoSalud();
        e.setCaballo(c);
        e.setTipo(tipo);
        e.setFecha(fecha);
        e.setProximaFecha(proxima);
        if (coste != null) e.setCoste(new BigDecimal(coste));
        eventos.save(e);
    }

    private void sesion(Caballo c, LocalDate fecha, TipoSesion tipo, int minutos, int valoracion, String notas) {
        var s = new Sesion();
        s.setCaballo(c);
        s.setFecha(fecha);
        s.setTipo(tipo);
        s.setDuracionMin(minutos);
        s.setValoracion(valoracion);
        s.setNotas(notas);
        sesiones.save(s);
    }

    private void gasto(Caballo c, LocalDate fecha, CategoriaGasto categoria, String concepto, String importe) {
        var g = new Gasto();
        g.setCaballo(c);
        g.setFecha(fecha);
        g.setCategoria(categoria);
        g.setConcepto(concepto);
        g.setImporte(new BigDecimal(importe));
        gastos.save(g);
    }
}
