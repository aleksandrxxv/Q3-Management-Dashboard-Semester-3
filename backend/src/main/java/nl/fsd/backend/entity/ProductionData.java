package nl.fsd.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.function.Predicate;

@Entity
@Table(name="production_data")
@Getter
@Setter
public class ProductionData {
    @Id
    private Long id;
    private LocalDate startDate;
    private LocalTime startTime;
    private LocalDate endDate;
    private LocalTime endTime;
    private Double amount;
    private String name;
    private String description;
    @ManyToOne
    @JoinColumn(name="treeview_id")
    private Treeview machine;
    @ManyToOne @JoinColumn(name="treeview2_id")
    private Treeview mold;

    public <T> Predicate<T> getEndDate() {
    }
}
