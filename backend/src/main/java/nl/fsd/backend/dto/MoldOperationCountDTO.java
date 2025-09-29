package nl.fsd.backend.dto;

public interface MoldOperationCountDTO {

    Long getOperation();
    Integer getId();
    String getName();
    String getDescription();
    Integer getParent();
}