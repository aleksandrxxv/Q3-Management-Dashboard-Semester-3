package nl.fsd.backend.repository;

import nl.fsd.backend.dto.InstalledMoldsDTO;
import nl.fsd.backend.entity.Mold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
}