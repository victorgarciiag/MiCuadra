package com.micuadra.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter @Setter
public class Caballo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private String raza;
    private String sexo;
    private String capa;
    private LocalDate fechaNacimiento;

    /** Identificación y documentación */
    private String microchip;
    private String ueln;
    private String licenciaRfhe;

    /** Foto reducida en el navegador y guardada como data URL (suficiente para la primera versión). */
    @Column(columnDefinition = "text")
    private String foto;

    @Column(length = 2000)
    private String notas;
}
