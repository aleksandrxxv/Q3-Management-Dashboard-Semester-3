package nl.fsd.backend.service;

import nl.fsd.backend.dto.MachineStatusDTO;
import nl.fsd.backend.dto.MoldHealthDTO;

import java.util.List;

public interface MonitoringService {
    /**
     * Returns the status of all machines (operational, last run, current mold)
     */
    List<MachineStatusDTO> getAllMachineStatuses();

    /**
     * Returns health information of all molds
     */
    List<MoldHealthDTO> getAllMoldHealth();
}
