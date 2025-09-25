package nl.fsd.backend.controller;

import lombok.AllArgsConstructor;
import nl.fsd.backend.entity.Machine;
import nl.fsd.backend.service.MachineService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
