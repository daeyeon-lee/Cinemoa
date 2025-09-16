package io.ssafy.cinemoa.funding.service;

import io.ssafy.cinemoa.funding.dto.CardTypeFundingInfoDto;
import io.ssafy.cinemoa.funding.repository.ExpiringFundingRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ExpiringFundingService {

    private final ExpiringFundingRepository expiringFundingRepository;

    public List<CardTypeFundingInfoDto> getExpiringFundings(Long userId) {

        return expiringFundingRepository.findExpiringFundings(userId);
    }
}
