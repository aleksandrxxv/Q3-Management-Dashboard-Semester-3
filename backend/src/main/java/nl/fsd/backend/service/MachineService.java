package nl.fsd.backend.service;

import lombok.AllArgsConstructor;
import nl.fsd.backend.entity.Machine;
import nl.fsd.backend.repository.MachineRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class MachineService {
    private MachineRepository machineRepository;

    public List<Machine> getMachines() {
        return machineRepository.getMachines();
    }
}
