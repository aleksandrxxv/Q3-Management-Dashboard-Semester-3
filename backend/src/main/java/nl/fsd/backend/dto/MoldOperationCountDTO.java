package com.example.backend.dto;
import lombok.*;

@Getter
@Setter
public class MoldOperationCountDTO {

    private Long operation;
    private Integer id;
    private String naam;
    private String omschrijving;
    private Integer parent;


    public MoldOperationCountDTO() {
    }


    public MoldOperationCountDTO(Long operation, Integer id, String name, String description, Integer parent) {
        this.operation = operation;
        this.id = id;
        this.naam = name;
        this.omschrijving = description;
        this.parent = parent;
    }
