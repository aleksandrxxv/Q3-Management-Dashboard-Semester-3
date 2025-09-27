package nl.fsd.backend.service;

import lombok.AllArgsConstructor;
import nl.fsd.backend.entity.Mold;
import nl.fsd.backend.repository.MoldRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class MoldService {
    private MoldRepository moldRepository;

    public List<Mold> getMolds() {
        return moldRepository.getMolds();
    }
}
