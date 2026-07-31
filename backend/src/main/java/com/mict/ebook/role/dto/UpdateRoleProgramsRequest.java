package com.mict.ebook.role.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record UpdateRoleProgramsRequest(@NotNull List<String> programIds) {}
