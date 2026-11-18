package com.micuadra.repo;

import com.micuadra.domain.Sesion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface SesionRepository extends JpaRepository<Sesion, Long> {
    List<Sesion> findByCaballo_IdOrderByFechaDescIdDesc(Long caballoId);
    List<Sesion> findByFechaBetween(LocalDate desde, LocalDate hasta);
}
