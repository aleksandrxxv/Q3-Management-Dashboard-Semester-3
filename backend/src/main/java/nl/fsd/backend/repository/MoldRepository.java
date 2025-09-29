package nl.fsd.backend.repository;

import nl.fsd.backend.dto.InstalledMoldsDTO;
import nl.fsd.backend.dto.MoldMachineHistoryDTO;
import nl.fsd.backend.dto.MoldOperationCountDTO;
import nl.fsd.backend.dto.MoldWeeklyOperationDTO;
import nl.fsd.backend.entity.Mold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface MoldRepository extends JpaRepository<Mold, Integer> {

    @Query(value= """
        SELECT t.id, t.naam AS name, t.omschrijving AS description, 
        CASE t.parent
        WHEN 166 THEN 'Coldhalf'
        WHEN 167 THEN 'Hothalf'
        ELSE 'Complete'
        END AS type
        FROM treeview AS t
        JOIN production_data AS pd ON (pd.treeview_id = t.id) OR (pd.treeview2_id = t.id)
        WHERE (pd.start_date >= "2020-09-01" AND pd.start_date <= "2020-09-30" 
        AND pd.end_date >= "2020-09-01" AND pd.end_date <= "2020-09-30")
        AND (t.parent = 166 OR t.parent = 167 OR t.parent = 168);""", nativeQuery=true)
    List<Mold> getMolds();


    @Query(value = """
    SELECT COUNT(pd.board) AS operation, t.id, t.naam AS name, t.omschrijving AS description, t.parent
    FROM treeview AS t
    JOIN production_data AS pd ON (pd.treeview_id = t.id) OR (pd.treeview2_id = t.id)
    WHERE (pd.start_date >= :startDate AND pd.start_date <= :endDate
    AND pd.end_date >= :startDate AND pd.end_date <= :endDate)
    GROUP BY t.id""", nativeQuery = true)
    List<MoldOperationCountDTO> countOperationsPerMold(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query(value = """
    SELECT mmp.name AS machine, t.id, t.naam AS name, t.omschrijving AS description, t.parent, pd.start_date, pd.start_time, pd.end_date, pd.end_time
    FROM treeview AS t
    JOIN production_data AS pd ON (pd.treeview_id = t.id) OR (pd.treeview2_id = t.id)
    JOIN machine_monitoring_poorten AS mmp ON (mmp.board = pd.board AND mmp.port = pd.port)
    WHERE (pd.start_date >= :startDate AND pd.start_date <= :endDate
    AND pd.end_date >= :startDate AND pd.end_date <= :endDate)
    AND t.id = :moldId
    ORDER BY pd.start_date DESC, pd.end_date DESC""", nativeQuery = true)
    List<MoldMachineHistoryDTO> findMachineHistoryForMold(@Param("moldId") Integer moldId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query(value= """
        SELECT mmp.name,
               pd.treeview_id AS mold1_id,
               IF(pd.treeview_id = 0, 0, t1.naam) AS mold1_name,
               IF(pd.treeview_id = 0, 0, t1.omschrijving) AS mold1_desc,
               pd.treeview2_id AS mold2_id,
               IF(pd.treeview2_id = 0, 0, t2.naam) AS mold2_name,
               IF(pd.treeview2_id = 0, 0, t2.omschrijving) AS mold2_desc,
               pd.end_date
        FROM machine_monitoring_poorten AS mmp
        JOIN production_data AS pd ON (mmp.board = pd.board AND mmp.port = pd.port)
        JOIN treeview AS t1 ON (pd.treeview_id = t1.id) OR pd.treeview_id = 0
        JOIN treeview AS t2 ON (pd.treeview2_id = t2.id) OR pd.treeview2_id = 0
        WHERE (pd.start_date >= "2020-09-01" AND pd.start_date <= "2020-09-30" 
        AND pd.end_date >= "2020-09-01" AND pd.end_date <= "2020-09-30")
        AND mmp.visible = 1
        AND mmp.name = :machineName
        ORDER BY pd.start_date DESC, pd.end_date DESC
        LIMIT 1
        """, nativeQuery=true)
    InstalledMoldsDTO getInstalledMolds(@Param("machineName") String machineName);

    @Query(value = """
        SELECT YEARWEEK(pd.start_date, 1) AS week,
            COUNT(pd.board) AS operation
        FROM production_data pd
        WHERE ((pd.treeview_id = :moldId) OR (pd.treeview2_id = :moldId))
        AND (pd.start_date >= :startDate AND pd.start_date <= :endDate)
        AND (pd.end_date >= :startDate AND pd.end_date <= :endDate)
        GROUP BY YEARWEEK(pd.start_date, 1)
        ORDER BY week
        """, nativeQuery = true)
    List<MoldWeeklyOperationDTO> countOperationsPerWeekForMold(
            @Param("moldId") Integer moldId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query(value = """
        SELECT COUNT(pd.board) AS operation, 
            t.id AS id, 
            t.naam AS name, 
            t.omschrijving AS description, 
            t.parent AS parent
        FROM treeview AS t
        JOIN production_data AS pd 
        ON (pd.treeview_id = t.id) OR (pd.treeview2_id = t.id)
        WHERE (pd.start_date >= :startDate AND pd.start_date <= :endDate
        AND pd.end_date >= :startDate AND pd.end_date <= :endDate)
        GROUP BY t.id, t.naam, t.omschrijving, t.parent
        """, nativeQuery = true)
    List<MoldOperationCountDTO> countTotalOperationsPerMold(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );





}