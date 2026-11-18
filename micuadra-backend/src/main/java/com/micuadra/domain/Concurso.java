package com.micuadra.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter @Setter
public class Concurso {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private String lugar;

    @Column(nullable = false)
    private LocalDate fechaInicio;

    @JsonIgnoreProperties({"foto", "notas"})
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "concurso_caballo")
    private Set<Caballo> caballos = new HashSet<>();
}
