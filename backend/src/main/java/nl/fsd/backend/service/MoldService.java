package nl.fsd.backend.service;

import lombok.AllArgsConstructor;
import nl.fsd.backend.dto.MoldMachineHistoryDTO;
import nl.fsd.backend.dto.MoldOperationCountDTO;
import nl.fsd.backend.entity.Mold;
import nl.fsd.backend.repository.MoldRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@AllArgsConstructor
public class MoldService {
    private MoldRepository moldRepository;

    public List<Mold> getMolds() {
        return moldRepository.getMolds();
    }


    public List<MoldOperationCountDTO> getMoldOperationCounts(LocalDate getStartDate, LocalDate getEndDate) {

        return moldRepository.countOperationsPerMold(getStartDate, getEndDate);
    }

    public List<MoldMachineHistoryDTO> getMachineHistoryForMold(Integer moldId, LocalDate startDate, LocalDate endDate) {
        return moldRepository.findMachineHistoryForMold(moldId, startDate, endDate);
    }

}

