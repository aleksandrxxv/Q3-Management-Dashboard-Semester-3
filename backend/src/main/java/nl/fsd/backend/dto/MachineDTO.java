package nl.fsd.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class MachineDTO {
    private int id;
    private String name;
    private int board;
    private int port;
}
