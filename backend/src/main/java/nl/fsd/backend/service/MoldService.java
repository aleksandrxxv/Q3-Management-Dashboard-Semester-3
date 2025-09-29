package nl.fsd.backend.service;

import lombok.AllArgsConstructor;
import nl.fsd.backend.dto.InstalledMoldsDTO;
import nl.fsd.backend.dto.MoldMachineHistoryDTO;
import nl.fsd.backend.dto.MoldOperationCountDTO;
import nl.fsd.backend.dto.MoldWeeklyOperationDTO;
import nl.fsd.backend.entity.Mold;
import nl.fsd.backend.repository.MachineRepository;
import nl.fsd.backend.repository.MoldRepository;
import org.springframework.stereotype.Service;


import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class MoldService {
    private final MoldRepository moldRepository;
    private final MachineRepository machineRepository; // inject machine repo

    public List<Mold> getMolds() {
        return moldRepository.getMolds();
    }

    public InstalledMoldsDTO getInstalledMoldsForMachine(String machineName) {
        return moldRepository.getInstalledMolds(machineName);
    }

    public List<MoldOperationCountDTO> getMoldOperationCounts(LocalDate getStartDate, LocalDate getEndDate) {
        return moldRepository.countOperationsPerMold(getStartDate, getEndDate);
    }

    public List<MoldMachineHistoryDTO> getMachineHistoryForMold(Integer moldId, LocalDate startDate, LocalDate endDate) {
        return moldRepository.findMachineHistoryForMold(moldId, startDate, endDate);
    }

    public List<InstalledMoldsDTO> getAllMachinesAndMolds() {
        List<String> machineNames = machineRepository.getMachines()
                .stream()
                .map(m -> m.getName())
                .toList();

        List<InstalledMoldsDTO> results = new ArrayList<>();
        for (String machineName : machineNames) {
            InstalledMoldsDTO molds = moldRepository.getInstalledMolds(machineName);
            if (molds != null) {
                results.add(molds);
            }
        }
        return results;
    }

    public List<MoldWeeklyOperationDTO> getWeeklyOperationCounts(Integer moldId, LocalDate startDate, LocalDate endDate) {
        return moldRepository.countOperationsPerWeekForMold(moldId, startDate, endDate);
    }

    public List<MoldOperationCountDTO> getTotalMoldOperationCounts(LocalDate startDate, LocalDate endDate) {
        return moldRepository.countTotalOperationsPerMold(startDate, endDate);
    }





}

