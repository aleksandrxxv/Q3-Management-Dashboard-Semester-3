package nl.fsd.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public interface MoldMachineHistoryDTO {

    String getMachine();
    Integer getId();
    String getName();
    String getDescription();
    Integer getParent();
    LocalDate getStartDate();
    LocalTime getStartTime();
    LocalDate getEndDate();
    LocalTime getEndTime();

}