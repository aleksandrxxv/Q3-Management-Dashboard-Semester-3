package nl.fsd.backend.repository;

import nl.fsd.backend.entity.ProductionData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductionDataRepository extends JpaRepository<ProductionData, Long> {
    // Note the underscore to drill into nested entity's id
    List<ProductionData> findByMachine_Id(Long machineId);

    List<ProductionData> findByMold_Id(Long moldId);

    Optional<ProductionData> findTopByMachine_IdOrderByEndDateDescEndTimeDesc(Long machineId);
}