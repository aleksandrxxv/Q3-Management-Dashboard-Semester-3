package nl.fsd.backend.repository;

import nl.fsd.backend.entity.ProductionData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductionDataRepository extends JpaRepository<ProductionData, Long> {
    List<ProductionData> findByMachineId(Long machineId);
    List<ProductionData> findByMoldId(Long moldId);

    Optional<ProductionData> findTopByMachineIdOrderByEndDateDescEndTimeDesc(Long machineId);
}