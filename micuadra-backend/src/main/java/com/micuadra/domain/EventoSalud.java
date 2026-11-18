package com.micuadra.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter @Setter
public class EventoSalud {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Caballo caballo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoEventoSalud tipo;

    @Column(nullable = false)
    private LocalDate fecha;

    /** Cuándo toca la siguiente (genera aviso) */
    private LocalDate proximaFecha;

    private String profesional;
    private BigDecimal coste;
    private String notas;
}
