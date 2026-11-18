package com.micuadra.repo;

import com.micuadra.domain.Caballo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CaballoRepository extends JpaRepository<Caballo, Long> {
    List<Caballo> findAllByOrderByNombreAsc();
}
