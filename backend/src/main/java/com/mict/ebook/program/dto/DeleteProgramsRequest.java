package com.mict.ebook.program.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record DeleteProgramsRequest(@NotEmpty List<Long> ids) {}
