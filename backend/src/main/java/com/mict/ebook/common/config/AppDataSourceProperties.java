package com.mict.ebook.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.datasource")
public record AppDataSourceProperties(String url, String username, String password, String driverClassName) {}
