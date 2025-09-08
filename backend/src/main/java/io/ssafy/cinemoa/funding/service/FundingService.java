package io.ssafy.cinemoa.funding.service;

import io.ssafy.cinemoa.funding.dto.FundingCreateRequest;
import io.ssafy.cinemoa.funding.enums.FundingState;
import io.ssafy.cinemoa.funding.enums.FundingType;
import io.ssafy.cinemoa.funding.repository.FundingRepository;
import io.ssafy.cinemoa.funding.repository.entity.Funding;
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FundingService {

    private final FundingRepository fundingRepository;

    public void create(FundingCreateRequest request) {
        Funding funding = Funding.builder()
                .fundingType(FundingType.INSTANT)
                .bannerUrl(request.getPosterUrl())
                .content(request.getContent())
                .title(request.getTitle())
                .videoName(request.getVideoName())
//                .leader()
                .maxPeople(request.getMaxPeople())
                .screenDay(request.getScreenDay())
                .screenStartsOn(request.getScreenStartsOn())
                .screenEndsOn(request.getScreenEndsOn())
                .state(FundingState.EVALUATING)
                .endsOn(request.getScreenDay().minusDays(7))
                .build();

        fundingRepository.save(funding);


    }

    public void holdSeatOf(Long userId, Long fundingId) {
        //put seat info on redis, then reduce remaining seats.

        if (!fundingRepository.existsById(fundingId)) {
            throw ResourceNotFoundException.ofFunding();
        }
    }

    public void unholdSeatOf(Long userId, Long fundingId) {
        //remove seat info on redis, then increase remaining seats.
    }
}
