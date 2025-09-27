package com.example.backend.dto;

import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Date;

public class MoldMachineHistoryDTO {

    private String machine;
    private Integer id;
    private String naam;
    private String omschrijving;
    private Integer parent;
    private LocalDate startDate;
    private LocalTime startTime;
    private LocalDate endDate;
    private LocalTime endTime;


    public MoldMachineHistoryDTO() {
    }


    public MoldMachineHistoryDTO(String machine, Integer id, String naam, String omschrijving, Integer parent, Date startDate, Time startTime, Date endDate, Time endTime) {
        this.machine = machine;
        this.id = id;
        this.naam = naam;
        this.omschrijving = omschrijving;
        this.parent = parent;
        this.startDate = new java.sql.Date(startDate.getTime()).toLocalDate();
        this.startTime = startTime.toLocalTime();
        this.endDate = new java.sql.Date(endDate.getTime()).toLocalDate();
        this.endTime = endTime.toLocalTime();
    }


    // get set

    public String getMachine() {
        return machine;
    }

    public void setMachine(String machine) {
        this.machine = machine;
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

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }
}