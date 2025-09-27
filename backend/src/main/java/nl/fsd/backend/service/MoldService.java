package nl.fsd.backend.service;

import lombok.AllArgsConstructor;
import nl.fsd.backend.entity.Mold;
import nl.fsd.backend.repository.MoldRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class MoldService {
    private MoldRepository moldRepository;

    public List<Mold> getMolds() {
        return moldRepository.getMolds();
    }




    /**
     * Gets the number of operations for all molds within a date range.
     */
    public List<MoldOperationCountDTO> getMoldOperationCounts(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = moldRepository.countOperationsPerMold(startDate, endDate);
        return results.stream()
                .map(this::mapToMoldOperationCountDTO)
                .collect(Collectors.toList());
    }

    /**
     * Gets the machine history for a single mold within a date range.
     */
    public List<MoldMachineHistoryDTO> getMoldMachineHistory(Integer moldId, LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = moldRepository.findMachineHistoryForMold(moldId, startDate, endDate);
        return results.stream()
                .map(this::mapToMoldMachineHistoryDTO)
                .collect(Collectors.toList());
    }

    /**
     * Helper method to convert the raw Object array from the operation count query
     * into a MoldOperationCountDTO.
     * The order and type of elements must match the SELECT clause in the query.
     */
    private MoldOperationCountDTO mapToMoldOperationCountDTO(Object[] result) {
        // SQL COUNT returns BigInteger, which we convert to Long.
        Long operation = ((BigInteger) result[0]).longValue();
        Integer id = (Integer) result[1];
        String naam = (String) result[2];
        String omschrijving = (String) result[3];
        Integer parent = (Integer) result[4];

        return new MoldOperationCountDTO(operation, id, naam, omschrijving, parent);
    }

    /**
     * Helper method to convert the raw Object array from the machine history query
     * into a MoldMachineHistoryDTO.
     * The order and type of elements must match the SELECT clause in the query.
     */
    private MoldMachineHistoryDTO mapToMoldMachineHistoryDTO(Object[] result) {
        String machine = (String) result[0];
        Integer id = (Integer) result[1];
        String naam = (String) result[2];
        String omschrijving = (String) result[3];
        Integer parent = (Integer) result[4];
        // Database drivers often return java.util.Date for DATE and java.sql.Time for TIME
        Date startDate = (Date) result[5];
        Time startTime = (Time) result[6];
        Date endDate = (Date) result[7];
        Time endTime = (Time) result[8];

        return new MoldMachineHistoryDTO(machine, id, naam, omschrijving, parent, startDate, startTime, endDate, endTime);
    }
}
}
