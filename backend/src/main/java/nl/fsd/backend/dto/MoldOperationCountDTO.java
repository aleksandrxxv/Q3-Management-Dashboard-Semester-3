package nl.fsd.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public interface MoldOperationCountDTO {

    Long getOperation();
    Integer getId();
    String getName();
    String getDescription();
    Integer getParent();
}