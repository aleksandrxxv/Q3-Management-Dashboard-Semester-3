package nl.fsd.backend.service;

import lombok.RequiredArgsConstructor;
import nl.fsd.backend.dto.MachineStatusDTO;
import nl.fsd.backend.dto.MoldHealthDTO;
import nl.fsd.backend.entity.ProductionData;
import nl.fsd.backend.entity.TreeView;
import nl.fsd.backend.repository.ProductionDataRepository;
import nl.fsd.backend.repository.TreeViewRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MonitoringServiceImpl implements MonitoringService {
    private final TreeViewRepository treeviewRepo;
    private final ProductionDataRepository productionRepo;


    private boolean isMachine(TreeView entity) {
        // Matches 1 uppercase letter followed by 1+ digits
        return entity.getNaam() != null && entity.getNaam().matches("^[A-Z]\\d+$");
    }

    @Override
    public List<MachineStatusDTO> getAllMachineStatuses() {
        return treeviewRepo.findAll().stream()
                .filter(this::isMachine)
                .map(this::buildMachineStatus)
                .collect(Collectors.toList());
    }



    @Override
    public List<MoldHealthDTO> getAllMoldHealth() {
        return treeviewRepo.findAll().stream()
                .filter(t -> !isMachine(t))
                .map(this::buildMoldHealth)
                .collect(Collectors.toList());
    }


    private MachineStatusDTO buildMachineStatus(TreeView machine) {
        Optional<ProductionData> lastRunOpt =
                productionRepo.findTopByMachine_IdOrderByEndDateDescEndTimeDesc(machine.getId());

        boolean activeNow = false;
        LocalDate lastStartDate = null;
        LocalTime lastStartTime = null;
        LocalDate lastEndDate = null;
        LocalTime lastEndTime = null;
        Long currentMoldId = null;
        String currentMoldName = null;

        if (lastRunOpt.isPresent()) {
            ProductionData lastRun = lastRunOpt.get();
            lastStartDate = lastRun.getStartDate();
            lastStartTime = lastRun.getStartTime();
            lastEndDate = lastRun.getEndDate();
            lastEndTime = lastRun.getEndTime();

            activeNow = lastRun.getEndDate().isEqual(LocalDate.now());

            if (lastRun.getMold() != null) {
                currentMoldId = lastRun.getMold().getId();
                currentMoldName = lastRun.getMold().getNaam();
            }
        }

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
        List<ProductionData> runs = productionRepo.findByMold_Id(mold.getId());

        long totalOps = runs.stream()
                .mapToLong(r -> r.getAmount().longValue())
                .sum();

        Set<String> machines = runs.stream()
                .map(r -> r.getMachine() != null ? r.getMachine().getNaam() : "UNKNOWN" + r.getId())
                .collect(Collectors.toSet());

        Map<String, Long> opsPerWeek = runs.stream()
                .collect(Collectors.groupingBy(
                        r -> getYearWeek(r.getStartDate()),
                        Collectors.summingLong(r -> r.getAmount().longValue())
                ));

        return new MoldHealthDTO(
                mold.getId(),
                mold.getNaam(),
                totalOps,
                machines,
                opsPerWeek
        );
    }

    private String getYearWeek(LocalDate date) {
        WeekFields wf = WeekFields.of(Locale.getDefault());
        int weekNumber = date.get(wf.weekOfWeekBasedYear());
        int year = date.getYear();
        return year + "-W" + weekNumber;
    }
}
