package nl.fsd.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name="treeview")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Mold {
    @Id
    private int id;

    @Column(name = "naam") // Mapped field 'name' to database column 'naam'
    private String name;

    @Column(name = "omschrijving") // Mapped field 'description' to database column 'omschrijving'
    private String description;


    private Integer parent;
}