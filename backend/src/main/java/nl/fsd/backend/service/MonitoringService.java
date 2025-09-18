package nl.fsd.backend.service;

import nl.fsd.backend.dto.MachineStatusDTO;
import nl.fsd.backend.dto.MoldHealthDTO;

import java.util.List;

public interface MonitoringService {
    List<MachineStatusDTO> getAllMachineStatuses();

    List<MoldHealthDTO> getAllMoldHealth();
}
