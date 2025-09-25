package nl.fsd.backend.dto;

import java.time.LocalDateTime;

public interface MachineDataDTO {
    int getId();
    String getName();
    LocalDateTime getTimestamp();
    double getShot_time();
}
