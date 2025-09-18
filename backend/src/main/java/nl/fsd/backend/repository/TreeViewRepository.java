package nl.fsd.backend.repository;

import nl.fsd.backend.entity.TreeView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TreeViewRepository extends JpaRepository<TreeView, Long> {
    List<TreeView> findByObject(String object);
}
