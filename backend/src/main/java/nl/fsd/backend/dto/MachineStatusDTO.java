package nl.fsd.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
public class MachineStatusDTO {
    private Long machineId;
    private String machineName;
    private boolean activeNow;
    private LocalDate lastStartDate;
    private LocalTime lastStartTime;
    private LocalDate lastEndDate;
    private LocalTime lastEndTime;
    private Long currentMoldId;
    private String currentMoldName;
}
