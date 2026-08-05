package com.mict.ebook.admin.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record UpdateAdminRolesRequest(@NotNull List<Long> roleIds) {}
