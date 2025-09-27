package nl.fsd.backend.dto;

public interface InstalledMoldsDTO {
    String getName();         // machine name
    int getMold1_id();
    String getMold1_name();
    String getMold1_desc();
    int getMold2_id();
    String getMold2_name();
    String getMold2_desc();
    String getEnd_date();     // or LocalDate if column is DATE
}