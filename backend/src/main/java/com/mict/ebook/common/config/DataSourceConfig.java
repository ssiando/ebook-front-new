package com.mict.ebook.common.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class DataSourceConfig {

    private final AppDataSourceProperties dataSourceProperties;

    @Bean
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(dataSourceProperties.url());
        config.setUsername(dataSourceProperties.username());
        config.setPassword(dataSourceProperties.password());
        config.setDriverClassName(dataSourceProperties.driverClassName());
        return new HikariDataSource(config);
    }
}
