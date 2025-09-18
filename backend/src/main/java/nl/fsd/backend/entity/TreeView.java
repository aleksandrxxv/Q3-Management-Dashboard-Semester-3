package nl.fsd.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name="treeview")
@Getter
@Setter
public class TreeView {
    @Id
    private Long id;
    private String object; // M = Machine, O = Mold
    private String naam;
    // other fields…
}
