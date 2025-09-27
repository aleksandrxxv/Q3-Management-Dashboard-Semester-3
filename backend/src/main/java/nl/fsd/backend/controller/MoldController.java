package nl.fsd.backend.controller;

import lombok.AllArgsConstructor;
import nl.fsd.backend.entity.Mold;
import nl.fsd.backend.service.MoldService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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


    @GetMapping("/operations/count") // change
    public List<MoldOperationCountDTO> getOperationCounts(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return moldService.getMoldOperationCounts(startDate, endDate);
    }

    @GetMapping("/{id}/history") // change
    public List<MoldMachineHistoryDTO> getMachineHistory(
            @PathVariable("id") Integer moldId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return moldService.getMoldMachineHistory(moldId, startDate, endDate);
    }
}

}
