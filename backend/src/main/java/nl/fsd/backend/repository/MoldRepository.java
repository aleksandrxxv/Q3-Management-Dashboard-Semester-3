package nl.fsd.backend.repository;

import nl.fsd.backend.dto.MoldDTO;

import java.util.List;

public interface MoldRepository {
    List<MoldDTO> getMolds();
}
