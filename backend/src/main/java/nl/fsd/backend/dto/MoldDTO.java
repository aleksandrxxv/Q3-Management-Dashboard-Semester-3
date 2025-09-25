package nl.fsd.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class MoldDTO {
    private int id;
    private String name;
    private String description;
    private String type;
}
