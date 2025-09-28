package nl.fsd.backend.controller;

import lombok.AllArgsConstructor;
import nl.fsd.backend.dto.InstalledMoldsDTO;
import nl.fsd.backend.dto.MoldMachineHistoryDTO;
import nl.fsd.backend.dto.MoldOperationCountDTO;
import nl.fsd.backend.entity.Mold;
import nl.fsd.backend.service.MoldService;
import org.springframework.web.bind.annotation.*;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import java.time.LocalDate;
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

    @GetMapping("/{machineName}")
    public InstalledMoldsDTO getInstalledMoldsForMachine(@PathVariable String machineName) {
        return moldService.getInstalledMoldsForMachine(machineName);
    }


    @GetMapping("/operations/count")
    public List<MoldOperationCountDTO> getOperationCounts(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate getStartDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate getEndDate
    ) {
        return moldService.getMoldOperationCounts(getStartDate, getEndDate);
    }

    @GetMapping("/{moldId}/history")
    public List<MoldMachineHistoryDTO> getMachineHistoryForMold(
            @PathVariable Integer moldId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return moldService.getMachineHistoryForMold(moldId, startDate, endDate);
}

}
