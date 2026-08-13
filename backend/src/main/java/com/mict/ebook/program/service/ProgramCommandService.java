package com.mict.ebook.program.service;

import com.mict.ebook.common.exception.BusinessException;
import com.mict.ebook.program.domain.Program;
import com.mict.ebook.program.domain.ProgramErrorCode;
import com.mict.ebook.program.dto.DeleteProgramsRequest;
import com.mict.ebook.program.dto.ProgramItemRequest;
import com.mict.ebook.program.dto.ProgramListResponse;
import com.mict.ebook.program.dto.SaveProgramsRequest;
import com.mict.ebook.program.mapper.ProgramRestMapper;
import com.mict.ebook.program.repository.mapper.ProgramMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class ProgramCommandService {

    private final ProgramMapper programMapper;
    private final ProgramRestMapper programRestMapper;

    public ProgramListResponse saveAll(SaveProgramsRequest request, Long currentAdminPk) {
        List<Program> saved = request.programs().stream()
                .map(item -> save(item, currentAdminPk))
                .toList();
        return ProgramListResponse.of(programRestMapper.toResponses(saved));
    }

    public void deleteAll(DeleteProgramsRequest request) {
        programMapper.deleteByIds(request.ids());
    }

    private Program save(ProgramItemRequest item, Long currentAdminPk) {
        if (item.isNew()) {
            if (programMapper.existsByWorkspaceIdAndCode(item.workspaceId(), item.code())) {
                throw new BusinessException(ProgramErrorCode.CODE_DUPLICATE);
            }
            Program program = Program.createNew(
                    item.workspaceId(),
                    item.parentProgramId(),
                    item.code(),
                    item.name(),
                    item.type(),
                    item.httpMethod(),
                    item.url(),
                    item.sortOrder(),
                    item.displayYn(),
                    item.useYn(),
                    item.i18nKeyId(),
                    item.description(),
                    currentAdminPk);
            programMapper.insert(program);
            return program;
        }

        Program program = findById(item.id());
        if (programMapper.existsByWorkspaceIdAndCodeExcludingId(item.workspaceId(), item.code(), item.id())) {
            throw new BusinessException(ProgramErrorCode.CODE_DUPLICATE);
        }
        program.update(
                item.parentProgramId(),
                item.code(),
                item.name(),
                item.type(),
                item.httpMethod(),
                item.url(),
                item.sortOrder(),
                item.displayYn(),
                item.useYn(),
                item.i18nKeyId(),
                item.description(),
                currentAdminPk);
        programMapper.update(program);
        return program;
    }

    private Program findById(Long id) {
        return programMapper.findById(id).orElseThrow(() -> new BusinessException(ProgramErrorCode.NOT_FOUND));
    }
}
