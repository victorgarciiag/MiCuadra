package com.micuadra.repo;

import com.micuadra.domain.EventoSalud;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface EventoSaludRepository extends JpaRepository<EventoSalud, Long> {
    List<EventoSalud> findByCaballo_IdOrderByFechaDesc(Long caballoId);
    List<EventoSalud> findByProximaFechaIsNotNull();
    List<EventoSalud> findByProximaFechaBetween(LocalDate desde, LocalDate hasta);
}
