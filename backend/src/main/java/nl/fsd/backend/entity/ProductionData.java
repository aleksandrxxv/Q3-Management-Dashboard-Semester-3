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

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "treeview_id")
    private Integer treeviewId;

    @Column(name = "treeview2_id")
    private Integer treeview2Id;

    @Column(name = "board")
    private Integer board;

    @Column(name = "port")
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

