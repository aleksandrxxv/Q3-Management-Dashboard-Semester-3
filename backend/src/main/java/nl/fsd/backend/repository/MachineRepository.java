package nl.fsd.backend.repository;

import nl.fsd.backend.dto.MachineDataDTO;
import nl.fsd.backend.entity.Machine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface MachineRepository extends JpaRepository<Machine, Integer> {
    @Query(value = """
            SELECT DISTINCT t.id, mmp.NAME, mmp.board, mmp.port, mmp.visible
                FROM machine_monitoring_poorten AS mmp
                JOIN production_data AS pd ON (mmp.board = pd.board AND mmp.port = pd.port)
                JOIN treeview AS t ON (mmp.name = t.naam)
                WHERE (pd.start_date >= "2020-09-01" AND pd.start_date <= "2020-09-30"
                AND pd.end_date >= "2020-09-01" AND pd.end_date <= "2020-09-30")
                AND mmp.visible = 1;""", nativeQuery = true)
    List<Machine> getMachines();

    @Query(value = """
            SELECT DISTINCT mmp.id, mmp.name, md.timestamp, md.shot_time
            FROM machine_monitoring_poorten AS mmp
            JOIN production_data AS pd ON (mmp.board = pd.board AND mmp.port = pd.port)
            JOIN monitoring_data_202009 AS md ON (pd.board = md.board AND pd.port = md.port)
            WHERE (md.datum >= :startDate AND md.datum <= :endDate)
            AND (md.timestamp >= :startTimestamp AND md.timestamp <= :endTimestamp)
            AND mmp.visible = 1
            AND mmp.name = :machineName""", nativeQuery = true)
    List<MachineDataDTO> getMachineData(@Param("machineName") String machineName,
                                     @Param("startDate") LocalDate startDate,
                                     @Param("endDate") LocalDate endDate,
                                     @Param("startTimestamp") LocalDateTime startTimestamp,
                                     @Param("endTimestamp") LocalDateTime endTimestamp);
}
