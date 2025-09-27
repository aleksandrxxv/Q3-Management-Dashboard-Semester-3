package com.example.backend.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "production_data")
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


    // Constructor with all fields.
    //  Useful for creating new instances of this object

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

    // get set

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
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

    public Integer getTreeviewId() {
        return treeviewId;
    }

    public void setTreeviewId(Integer treeviewId) {
        this.treeviewId = treeviewId;
    }

    public Integer getTreeview2Id() {
        return treeview2Id;
    }

    public void setTreeview2Id(Integer treeview2Id) {
        this.treeview2Id = treeview2Id;
    }

    public Integer getBoard() {
        return board;
    }

    public void setBoard(Integer board) {
        this.board = board;
    }

    public Integer getPort() {
        return port;
    }

    public void setPort(Integer port) {
        this.port = port;
    }
}