package com.mict.ebook.program.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record SaveProgramsRequest(@NotEmpty @Valid List<ProgramItemRequest> programs) {}
