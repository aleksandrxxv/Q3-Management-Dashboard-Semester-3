package nl.fsd.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;
import java.util.Set;

@Data
@AllArgsConstructor
public class MoldHealthDTO {
    private Long moldId;
    private String moldName;
    private Long totalOperations;
    private Set<String> machinesUsed;  // machine names
    private Map<String, Long> opsPerWeek; // week string -> ops
}
