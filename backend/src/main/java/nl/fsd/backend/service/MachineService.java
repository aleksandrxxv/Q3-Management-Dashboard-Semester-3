package nl.fsd.backend.service;

import lombok.AllArgsConstructor;
import nl.fsd.backend.dto.MachineDataDTO;
import nl.fsd.backend.entity.Machine;
import nl.fsd.backend.repository.MachineRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class MachineService {
    private MachineRepository machineRepository;

    public List<Machine> getMachines() {
        return machineRepository.getMachines();
    }

    public List<MachineDataDTO> getMachineData(String machineName,
                                            LocalDate startDate,
                                            LocalDate endDate,
                                            LocalDateTime startTimestamp,
                                            LocalDateTime endTimestamp) {
        return machineRepository.getMachineData(machineName, startDate, endDate, startTimestamp, endTimestamp);
    }
}
