package nl.fsd.backend.dto;

import lombok.Data;

@Data
public class MachineDTO {
    private int id;
    private String name;
    private int board;
    private int port;
    private int visible;
}
