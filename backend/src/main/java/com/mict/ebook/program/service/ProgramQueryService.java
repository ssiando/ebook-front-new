package com.mict.ebook.program.service;

import com.mict.ebook.program.dto.ProgramListResponse;
import com.mict.ebook.program.dto.ProgramSearchRequest;
import com.mict.ebook.program.mapper.ProgramRestMapper;
import com.mict.ebook.program.repository.mapper.ProgramMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProgramQueryService {

    private static final String NO_FILTER = "ALL";

    private final ProgramMapper programMapper;
    private final ProgramRestMapper programRestMapper;

    public ProgramListResponse search(ProgramSearchRequest request) {
        var programs = programMapper.search(
                request.workspaceId(), request.keyword(), normalize(request.type()), toBoolean(request.useYn()));
        return ProgramListResponse.of(programRestMapper.toResponses(programs));
    }

    private String normalize(String filter) {
        return filter == null || NO_FILTER.equals(filter) ? null : filter;
    }

    private Boolean toBoolean(String useYn) {
        if (useYn == null || NO_FILTER.equals(useYn)) {
            return null;
        }
        return "Y".equals(useYn);
    }
}
