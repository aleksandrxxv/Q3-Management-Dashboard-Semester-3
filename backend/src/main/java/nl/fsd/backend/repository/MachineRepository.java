package nl.fsd.backend.repository;

import nl.fsd.backend.entity.Machine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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

}
