package com.example.backend.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.*;


@Entity
@Table(name = "production_data")
@Getter
@Setter
public class ProductionData {

    @Id
    private Integer id;


    private LocalDate startDate;


    private LocalTime startTime;


    private LocalDate endDate;


    private LocalTime endTime;


    private Integer treeviewId;


    private Integer treeview2Id;


    private Integer board;


    private Integer port;


    public ProductionData() {
    }



    public ProductionData(Integer id, LocalDate startDate, LocalTime startTime, LocalDate endDate, LocalTime endTime, Integer treeviewId, Integer treeview2Id, Integer board, Integer port) {
        this.id = id;
        this.startDate = startDate;
        this.startTime = startTime;
        this.endDate = endDate;
        this.endTime = endTime;
        this.treeviewId = treeviewId;
        this.treeview2Id = treeview2Id;
        this.board = board;
        this.port = port;
    }

