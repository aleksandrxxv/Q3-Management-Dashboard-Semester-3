package nl.fsd.backend.controller;

import lombok.AllArgsConstructor;
import nl.fsd.backend.dto.MachineDTO;
import nl.fsd.backend.dto.MachineDataDTO;
import nl.fsd.backend.service.MachineService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/machines")
@AllArgsConstructor
public class MachineController {
    private final MachineService machineService;

    @GetMapping
    public List<MachineDTO> getMachines() {
        return machineService.getMachines();
    }

    @GetMapping("/{name}")
    public List<MachineDataDTO> getMachineData(@PathVariable String name,
                                               @RequestParam LocalDate startDate,
                                               @RequestParam LocalDate endDate,
                                               @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTimestamp,
                                               @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTimestamp) {
        return machineService.getMachineData(name, startDate, endDate, startTimestamp, endTimestamp);
    }
}
