package nl.fsd.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name="treeview")
@Getter
@Setter
public class Mold {
    @Id
    private int id;
    private String name;
    private String description;
    private String type;
}

