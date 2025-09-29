package nl.fsd.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public interface MoldMachineHistoryDTO {

    String getMachine();
    Integer getId();
    String getName();
    String getDescription();
    Integer getParent();
    LocalDate getStart_Date();
    LocalTime getStart_Time();
    LocalDate getEnd_Date();
    LocalTime getEnd_Time();

}