package com.example.backend.entity;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "machine_monitoring_poorten")
public class MachineMonitoringPort {

    @Id
    private Integer id;

    private String name;

    private Integer board;

    private Integer port;

    public MachineMonitoringPort() {
    }


    public MachineMonitoringPort(Integer id, String name, Integer board, Integer port) {
        this.id = id;
        this.name = name;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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