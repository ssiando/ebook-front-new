package com.mict.ebook.program.mapper;

import com.mict.ebook.program.domain.Program;
import com.mict.ebook.program.dto.ProgramResponse;
import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProgramRestMapper {

    ProgramResponse toResponse(Program program);

    List<ProgramResponse> toResponses(List<Program> programs);
}
