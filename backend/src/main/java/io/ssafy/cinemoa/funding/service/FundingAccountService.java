package io.ssafy.cinemoa.funding.service;

import io.ssafy.cinemoa.external.finance.Client.AccountApiClient;
import io.ssafy.cinemoa.external.finance.dto.AccountCreationResponse;
import io.ssafy.cinemoa.funding.event.AccountCreationRequestEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Service
@RequiredArgsConstructor
public class FundingAccountService {
    private final FundingService fundingService;
    private final AccountApiClient accountApiClient;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void createFundingAccount(AccountCreationRequestEvent event) {
        AccountCreationResponse response = accountApiClient.createAccount();
        fundingService.updateFundingAccount(event.getFundingId(), response.getAccountNo());
    }
}
