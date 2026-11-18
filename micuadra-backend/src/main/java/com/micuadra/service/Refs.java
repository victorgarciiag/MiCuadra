package com.micuadra.service;

import com.micuadra.domain.Caballo;
import com.micuadra.repo.CaballoRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/** Resuelve ids a entidades o lanza 404. */
@Component
public class Refs {

    private final CaballoRepository caballos;

    public Refs(CaballoRepository caballos) {
        this.caballos = caballos;
    }

    public Caballo caballo(Long id) {
        return find(caballos, id, "Caballo");
    }

    public static <T> T find(JpaRepository<T, Long> repo, Long id, String nombre) {
        return repo.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, nombre + " " + id + " no existe"));
    }
}
