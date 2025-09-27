package nl.fsd.backend.repository;

import nl.fsd.backend.entity.Mold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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
    SELECT COUNT(pd.board) AS operation, t.id, t.naam, t.omschrijving, t.parent
    FROM treeview AS t
    JOIN production_data AS pd ON (pd.treeview_id = t.id) OR (pd.treeview2_id = t.id)
    WHERE (pd.start_date >= :startDate AND pd.start_date <= :endDate
    AND pd.end_date >= :startDate AND pd.end_date <= :endDate)
    GROUP BY t.id""", nativeQuery = true)
    List<Object[]> countOperationsPerMold(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query(value = """
    SELECT mmp.name AS machine, t.id, t.naam, t.omschrijving, t.parent, pd.start_date, pd.start_time, pd.end_date, pd.end_time
    FROM treeview AS t
    JOIN production_data AS pd ON (pd.treeview_id = t.id) OR (pd.treeview2_id = t.id)
    JOIN machine_monitoring_poorten AS mmp ON (mmp.board = pd.board AND mmp.port = pd.port)
    WHERE (pd.start_date >= :startDate AND pd.start_date <= :endDate
    AND pd.end_date >= :startDate AND pd.end_date <= :endDate)
    AND t.id = :moldId
    ORDER BY pd.start_date DESC, pd.end_date DESC""", nativeQuery = true)
    List<Object[]> findMachineHistoryForMold(@Param("moldId") Integer moldId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);


}
