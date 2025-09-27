package com.example.backend.dto;

public class MoldOperationCountDTO {

    private Long operation;
    private Integer id;
    private String naam;
    private String omschrijving;
    private Integer parent;


    public MoldOperationCountDTO() {
    }


    public MoldOperationCountDTO(Long operation, Integer id, String naam, String omschrijving, Integer parent) {
        this.operation = operation;
        this.id = id;
        this.naam = naam;
        this.omschrijving = omschrijving;
        this.parent = parent;
    }

    // get set

    public Long getOperation() {
        return operation;
    }

    public void setOperation(Long operation) {
        this.operation = operation;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNaam() {
        return naam;
    }

    public void setNaam(String naam) {
        this.naam = naam;
    }

    public String getOmschrijving() {
        return omschrijving;
    }

    public void setOmschrijving(String omschrijving) {
        this.omschrijving = omschrijving;
    }

    public Integer getParent() {
        return parent;
    }

    public void setParent(Integer parent) {
        this.parent = parent;
    }
}