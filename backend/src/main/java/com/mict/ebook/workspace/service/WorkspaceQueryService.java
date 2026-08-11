package com.mict.ebook.workspace.service;

import com.mict.ebook.workspace.domain.Workspace;
import com.mict.ebook.workspace.dto.WorkspaceResponse;
import com.mict.ebook.workspace.repository.mapper.WorkspaceMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkspaceQueryService {

    private final WorkspaceMapper workspaceMapper;

    public List<WorkspaceResponse> findAll() {
        return workspaceMapper.findAll().stream().map(this::toResponse).toList();
    }

    private WorkspaceResponse toResponse(Workspace workspace) {
        return new WorkspaceResponse(workspace.getId(), workspace.getName(), workspace.getStat());
    }
}
