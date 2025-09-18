package nl.fsd.backend.controller;

import lombok.RequiredArgsConstructor;
import nl.fsd.backend.dto.MachineStatusDTO;
import nl.fsd.backend.dto.MoldHealthDTO;
import nl.fsd.backend.service.MonitoringService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final MonitoringService monitoringService; // interface injected

    @GetMapping("/machines")
    public List<MachineStatusDTO> getMachineStatuses() {
        return monitoringService.getAllMachineStatuses();
    }

    @GetMapping("/molds")
    public List<MoldHealthDTO> getMoldHealth() {
        return monitoringService.getAllMoldHealth();
    }
}
