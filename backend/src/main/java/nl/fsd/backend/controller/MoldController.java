package nl.fsd.backend.controller;

import lombok.AllArgsConstructor;
import nl.fsd.backend.dto.InstalledMoldsDTO;
import nl.fsd.backend.entity.Mold;
import nl.fsd.backend.service.MoldService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/molds")
@AllArgsConstructor
public class MoldController {
    private MoldService moldService;

    //get all molds
    @GetMapping
    public List<Mold> getMolds() {
        return moldService.getMolds();
    }

    @GetMapping("/installed/{machineName}")
    public InstalledMoldsDTO getInstalledMolds(@PathVariable String machineName) {
        return moldService.getInstalledMoldsForMachine(machineName);
    }
}
