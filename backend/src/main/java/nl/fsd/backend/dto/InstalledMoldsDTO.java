package nl.fsd.backend.dto;

import java.time.LocalDate;

public interface InstalledMoldsDTO {
    String getName();         // machine name
    int getMold1_id();
    String getMold1_name();
    String getMold1_desc();
    int getMold2_id();
    String getMold2_name();
    String getMold2_desc();
    LocalDate getEnd_date();
}