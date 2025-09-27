package nl.fsd.backend.dto;

import java.time.LocalDate;

public interface MoldOperationCountDTO {

    Long getOperation();
    Integer getId();
    String getName();
    String getDescription();
    Integer getParent();
    LocalDate getStartDate();
    LocalDate getEndDate();

}