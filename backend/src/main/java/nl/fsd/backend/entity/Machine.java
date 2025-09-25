package nl.fsd.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name="machine_monitoring_poorten")
@Getter
@Setter
public class Machine {
    @Id
    private int id;
    private String name;
    private int board;
    private int port;
    private int visible;
}
