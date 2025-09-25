package nl.fsd.backend.entity;

import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class MachineData {
    @Id
    private int id;
    private String name;
    private LocalDateTime timestamp;
    private double shot_time;

    public MachineData(int id, String name, LocalDateTime timestamp, double shot_time) {
        this.id = id;
        this.name = name;
        this.timestamp = timestamp;
        this.shot_time = shot_time;
    }
}
