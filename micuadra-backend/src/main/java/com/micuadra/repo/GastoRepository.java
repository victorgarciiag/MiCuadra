package com.micuadra.repo;

import com.micuadra.domain.Gasto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface GastoRepository extends JpaRepository<Gasto, Long> {
    List<Gasto> findByCaballo_IdOrderByFechaDescIdDesc(Long caballoId);
    List<Gasto> findByFechaBetweenOrderByFechaDescIdDesc(LocalDate desde, LocalDate hasta);
}
