package nl.fsd.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
// this entity might be obsolete?
@Entity
@Table(name = "machine_monitoring_poorten")
@Getter
@Setter
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
}

