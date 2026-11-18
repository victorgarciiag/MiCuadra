package com.micuadra.repo;

import com.micuadra.domain.Concurso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ConcursoRepository extends JpaRepository<Concurso, Long> {
    List<Concurso> findByFechaInicioGreaterThanEqualOrderByFechaInicioAsc(LocalDate desde);
    List<Concurso> findByCaballos_Id(Long caballoId);
    List<Concurso> findByFechaInicioBetween(LocalDate desde, LocalDate hasta);
}
