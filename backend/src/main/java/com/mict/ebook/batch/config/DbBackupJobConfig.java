package com.mict.ebook.batch.config;

import com.mict.ebook.batch.job.DbBackupTasklet;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
@RequiredArgsConstructor
public class DbBackupJobConfig {

    public static final String JOB_NAME = "dbBackupJob";

    private final DbBackupTasklet dbBackupTasklet;

    @Bean
    public Job dbBackupJob(JobRepository jobRepository, Step dbBackupStep) {
        return new JobBuilder(JOB_NAME, jobRepository).start(dbBackupStep).build();
    }

    @Bean
    public Step dbBackupStep(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
        return new StepBuilder("dbBackupStep", jobRepository)
                .tasklet(dbBackupTasklet, transactionManager)
                .build();
    }
}
