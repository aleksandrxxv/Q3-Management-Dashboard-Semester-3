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
}
