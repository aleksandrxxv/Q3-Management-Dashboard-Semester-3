package nl.fsd.backend.service;

import lombok.RequiredArgsConstructor;
import nl.fsd.backend.dto.MachineStatusDTO;
import nl.fsd.backend.dto.MoldHealthDTO;
import nl.fsd.backend.entity.TreeView;
import nl.fsd.backend.repository.ProductionDataRepository;
import nl.fsd.backend.repository.TreeViewRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MonitoringServiceImpl implements MonitoringService {

    private final TreeViewRepository treeviewRepo;
    private final ProductionDataRepository productionRepo;

    @Override
    public List<MachineStatusDTO> getAllMachineStatuses() {
        List<TreeView> machines = treeviewRepo.findByObject("M");
        return machines.stream()
                .map(this::buildMachineStatus)
                .collect(Collectors.toList());
    }

    // ===== private helpers (same as before) =====
    private MachineStatusDTO buildMachineStatus(TreeView machine) {
        // same code as earlier to compute DTO …
        return new MachineStatusDTO(
                machine.getId(),
                machine.getNaam(),
                activeNow,
                lastStartDate, lastStartTime,
                lastEndDate, lastEndTime,
                currentMoldId, currentMoldName
        );
    }

    private MoldHealthDTO buildMoldHealth(TreeView mold) {
        // same code as earlier to compute DTO …
        return new MoldHealthDTO(
                mold.getId(),
                mold.getNaam(),
                totalOps,
                machines,
                opsPerWeek
        );
    }


    @Override
    public List<MoldHealthDTO> getAllMoldHealth() {
        List<TreeView> molds = treeviewRepo.findByObject("O");
        return molds.stream()
                .map(this::buildMoldHealth)
                .collect(Collectors.toList());
    }

    private String getYearWeek(LocalDate date) {
        WeekFields wf = WeekFields.of(Locale.getDefault());
        int weekNumber = date.get(wf.weekOfWeekBasedYear());
        int year = date.getYear();
        return year + "-W" + weekNumber;
    }
}
