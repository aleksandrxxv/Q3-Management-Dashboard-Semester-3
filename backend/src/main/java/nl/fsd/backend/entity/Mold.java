package nl.fsd.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class Mold {
    private int id;
    private String name;
    private String description;
    private String type;
}
