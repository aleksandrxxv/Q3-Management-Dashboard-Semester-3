package com.example.backend.dto;

import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Date;
import lombok.*;

@Getter
@Setter
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


