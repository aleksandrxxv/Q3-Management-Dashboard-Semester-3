package nl.fsd.backend.controller;

import lombok.AllArgsConstructor;
import nl.fsd.backend.dto.MachineDataDTO;
import nl.fsd.backend.entity.Machine;
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
    private MachineService machineService;

    //get all machines
    @GetMapping
    public List<Machine> getMachines() {
        return machineService.getMachines();
    }

    //get installed molds per machine

    //get machine data
    @GetMapping("/{name}")
    public List<MachineDataDTO> getMachineData(@PathVariable String name,
                                            @RequestParam LocalDate startDate,
                                            @RequestParam LocalDate endDate,
                                            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTimestamp,
                                            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTimestamp) {
        return machineService.getMachineData(name, startDate, endDate, startTimestamp, endTimestamp);
    }
}
