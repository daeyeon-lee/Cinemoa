package io.ssafy.cinemoa.funding.service;

import io.ssafy.cinemoa.funding.event.FundingScoreUpdateEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Service
@RequiredArgsConstructor
public class FundingScoreService {

    private final FundingService fundingService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleFundingScoreEvent(FundingScoreUpdateEvent event) {
        fundingService.recalculateScore(event.getFundingId());
    }


}
