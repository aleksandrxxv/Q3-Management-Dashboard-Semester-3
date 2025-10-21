package nl.fsd.backend.service;

import lombok.AllArgsConstructor;
import nl.fsd.backend.dto.MachineDTO;
import nl.fsd.backend.dto.MachineDataDTO;
import nl.fsd.backend.entity.Machine;
import nl.fsd.backend.repository.MachineRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class MachineService {
    private final MachineRepository machineRepository;

    public List<MachineDTO> getMachines() {
        return machineRepository.getMachines().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<MachineDataDTO> getMachineData(String machineName,
                                               LocalDate startDate,
                                               LocalDate endDate,
                                               LocalDateTime startTimestamp,
                                               LocalDateTime endTimestamp) {
        return machineRepository.getMachineData(machineName, startDate, endDate, startTimestamp, endTimestamp);
    }

    private MachineDTO toDTO(Machine machine) {
        MachineDTO dto = new MachineDTO();
        dto.setId(machine.getId());
        dto.setName(machine.getName());
        dto.setBoard(machine.getBoard());
        dto.setPort(machine.getPort());
        dto.setVisible(machine.getVisible());
        return dto;
    }

}
