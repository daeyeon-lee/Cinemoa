package io.ssafy.cinemoa.favorite.service;

import io.ssafy.cinemoa.favorite.exception.FavoriteException;
import io.ssafy.cinemoa.favorite.repository.UserFavoriteRepository;
import io.ssafy.cinemoa.favorite.repository.entity.UserFavorite;
import io.ssafy.cinemoa.favorite.repository.entity.UserFavoriteId;
import io.ssafy.cinemoa.funding.repository.FundingRepository;
import io.ssafy.cinemoa.funding.repository.FundingStatRepository;
import io.ssafy.cinemoa.funding.repository.entity.Funding;
import io.ssafy.cinemoa.funding.repository.entity.FundingStat;
import io.ssafy.cinemoa.global.exception.InternalServerException;
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FundingFavoriteService {

    private final UserFavoriteRepository userFavoriteRepository;

    private final FundingRepository fundingRepository;
    private final FundingStatRepository statRepository;
    //private final UserRepository userRepository;

    @Transactional
    public void like(Long userId, Long fundingId) {

        Funding funding = fundingRepository.findById(fundingId)
                .orElseThrow(ResourceNotFoundException::ofFunding);

        // User 검색
        //User user = userRepository.findById(userId).orElseThrow(ResourceNotFoundException::ofUser);
        UserFavoriteId id = new UserFavoriteId(userId, fundingId);

        if (userFavoriteRepository.existsById(id)) {
            throw FavoriteException.ofLikeExists();
        }

        UserFavorite userFavorite = UserFavorite.builder()
                .id(id)
                .funding(funding)
                //user 등록
                .build();

        userFavoriteRepository.save(userFavorite);

        FundingStat fundingStat = statRepository.findByFunding_FundingId(fundingId)
                .orElse(new FundingStat(null, funding, 0, 0, 0, 0));

        fundingStat.setFavoriteCount(fundingStat.getFavoriteCount() + 1);

        statRepository.save(fundingStat);
    }

    @Transactional
    public void unlike(Long userId, Long fundingId) {

        Funding funding = fundingRepository.findById(fundingId)
                .orElseThrow(ResourceNotFoundException::ofFunding);

        // User 검색
        //User user = userRepository.findById(userId).orElseThrow(ResourceNotFoundException::ofUser);
        UserFavoriteId id = new UserFavoriteId(userId, fundingId);

        if (!userFavoriteRepository.existsById(id)) {
            throw FavoriteException.ofLikeDoesntExists();
        }

        userFavoriteRepository.deleteById(id);

        FundingStat fundingStat = statRepository.findByFunding_FundingId(fundingId)
                .orElseThrow(InternalServerException::ofUnknown);

        fundingStat.setFavoriteCount(fundingStat.getFavoriteCount() - 1);
    }
}
