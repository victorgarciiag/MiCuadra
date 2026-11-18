package com.micuadra.web;

import com.micuadra.domain.Caballo;
import com.micuadra.repo.CaballoRepository;
import com.micuadra.repo.ConcursoRepository;
import com.micuadra.service.Refs;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/caballos")
public class CaballoController {

    public record CaballoRequest(@NotBlank String nombre, String raza, String sexo, String capa,
                                 LocalDate fechaNacimiento, String microchip, String ueln,
                                 String licenciaRfhe, String foto, String notas) {}

    private final CaballoRepository caballos;
    private final ConcursoRepository concursos;
    private final Refs refs;

    public CaballoController(CaballoRepository caballos, ConcursoRepository concursos, Refs refs) {
        this.caballos = caballos;
        this.concursos = concursos;
        this.refs = refs;
    }

    @GetMapping
    public List<Caballo> listar() {
        return caballos.findAllByOrderByNombreAsc();
    }

    @GetMapping("/{id}")
    public Caballo obtener(@PathVariable Long id) {
        return refs.caballo(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Caballo crear(@Valid @RequestBody CaballoRequest req) {
        return caballos.save(aplicar(new Caballo(), req));
    }

    @PutMapping("/{id}")
    public Caballo actualizar(@PathVariable Long id, @Valid @RequestBody CaballoRequest req) {
        return caballos.save(aplicar(refs.caballo(id), req));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void borrar(@PathVariable Long id) {
        // Quitarlo antes de los concursos en los que esté inscrito (tabla intermedia)
        concursos.findByCaballos_Id(id).forEach(c -> c.getCaballos().removeIf(cab -> cab.getId().equals(id)));
        concursos.flush();
        caballos.deleteById(id);
    }

    private Caballo aplicar(Caballo c, CaballoRequest req) {
        c.setNombre(req.nombre());
        c.setRaza(req.raza());
        c.setSexo(req.sexo());
        c.setCapa(req.capa());
        c.setFechaNacimiento(req.fechaNacimiento());
        c.setMicrochip(req.microchip());
        c.setUeln(req.ueln());
        c.setLicenciaRfhe(req.licenciaRfhe());
        c.setFoto(req.foto());
        c.setNotas(req.notas());
        return c;
    }
}
