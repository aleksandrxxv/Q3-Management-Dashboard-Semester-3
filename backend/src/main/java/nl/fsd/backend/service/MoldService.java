package nl.fsd.backend.service;

import lombok.RequiredArgsConstructor;
import nl.fsd.backend.dto.InstalledMoldsDTO;
import nl.fsd.backend.entity.Mold;
import nl.fsd.backend.repository.MoldRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MoldService {
    private final MoldRepository moldRepository;

    public List<Mold> getMolds() {
        return moldRepository.getMolds();
    }

    public InstalledMoldsDTO getInstalledMoldsForMachine(String machineName) {
        return moldRepository.getInstalledMolds(machineName);
    }
}